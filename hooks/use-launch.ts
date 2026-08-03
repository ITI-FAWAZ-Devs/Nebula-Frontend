"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/utils/api";

export type AnalysisJob = {
  id: string;
  repositoryId: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  stage: string | null;
  error: string | null;
  queueJobId: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentationJob = {
  id: string;
  repositoryId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  stage: string | null;
  error: string | null;
  progress: number | null;
  queueJobId: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArchDocJob = {
  jobId: string;
  docId: string;
  status:
    | "PENDING"
    | "RETRIEVING"
    | "GENERATING"
    | "VERIFYING"
    | "COMPLETED"
    | "FAILED";
  errorMessage: string | null;
};

export type LaunchPhase = "idle" | "starting" | "running" | "docs-ready" | "error";

interface SnapshotPayload {
  analysis: AnalysisJob | null;
  documentation: DocumentationJob | null;
  architectureDoc: ArchDocJob | null;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function parseError(err: unknown): string {
  const e = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e.response?.data?.message ?? e.message ?? "Pipeline failed";
}

export function useLaunchPipeline(repoId: string | null) {
  const [analysis, setAnalysis] = useState<AnalysisJob | null>(null);
  const [documentation, setDocumentation] = useState<DocumentationJob | null>(null);
  const [archDoc, setArchDoc] = useState<ArchDocJob | null>(null);
  const [phase, setPhase] = useState<LaunchPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  const analysisRef = useRef<AnalysisJob | null>(null);
  const documentationRef = useRef<DocumentationJob | null>(null);
  const archDocRef = useRef<ArchDocJob | null>(null);
  const pipelineRef = useRef<Promise<void> | null>(null);

  const applyAnalysis = useCallback((job: AnalysisJob) => {
    analysisRef.current = job;
    setAnalysis(job);
  }, []);

  const applyDocumentation = useCallback((job: DocumentationJob) => {
    documentationRef.current = job;
    setDocumentation(job);
  }, []);

  const applyArchDoc = useCallback((job: ArchDocJob) => {
    archDocRef.current = job;
    setArchDoc(job);
  }, []);

  useEffect(() => {
    if (!repoId) return;

    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/repositories/${repoId}/progress/stream`,
      { withCredentials: true }
    );

    es.addEventListener("snapshot", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as SnapshotPayload;
        if (data.analysis) applyAnalysis(data.analysis);
        if (data.documentation) applyDocumentation(data.documentation);
        if (data.architectureDoc) applyArchDoc(data.architectureDoc);
      } catch {
        // ignore malformed payloads
      }
    });

    es.addEventListener("analysis", (e) => {
      try {
        applyAnalysis(JSON.parse((e as MessageEvent).data) as AnalysisJob);
      } catch {
        // ignore malformed payloads
      }
    });

    es.addEventListener("documentation", (e) => {
      try {
        applyDocumentation(JSON.parse((e as MessageEvent).data) as DocumentationJob);
      } catch {
        // ignore malformed payloads
      }
    });

    es.addEventListener("architecture-doc", (e) => {
      try {
        applyArchDoc(JSON.parse((e as MessageEvent).data) as ArchDocJob);
      } catch {
        // ignore malformed payloads
      }
    });

    es.addEventListener("error", (e) => {
      const data = (e as MessageEvent).data;
      if (data) {
        try {
          const parsed = JSON.parse(data) as { message?: string };
          if (parsed.message) setError(parsed.message);
        } catch {
          // connection-level error — EventSource will reconnect and re-sync via snapshot
        }
      }
    });

    return () => es.close();
  }, [repoId, applyAnalysis, applyDocumentation, applyArchDoc]);

  const waitForJob = useCallback(
    async (kind: "analysis" | "documentation" | "archDoc") => {
      const startedAt = Date.now();
      const maxWaitMs = 30 * 60 * 1000;
      while (true) {
        let status = "";
        let failMessage: string | null = null;

        if (kind === "analysis") {
          const job = analysisRef.current;
          status = job?.status ?? "";
          failMessage = job?.error ?? null;
        } else if (kind === "documentation") {
          const job = documentationRef.current;
          status = job?.status ?? "";
          failMessage = job?.error ?? null;
        } else {
          const job = archDocRef.current;
          status = job?.status ?? "";
          failMessage = job?.errorMessage ?? null;
        }

        if (status === "COMPLETED") return;
        if (status === "FAILED") {
          throw new Error(failMessage || `${kind} job failed`);
        }
        if (Date.now() - startedAt > maxWaitMs) {
          throw new Error(`${kind} job timed out after 30 minutes`);
        }

        try {
          if (kind === "analysis") {
            const res = await api.get(`/api/repositories/${repoId}/analysis`);
            applyAnalysis(res.data.data as AnalysisJob);
          } else if (kind === "documentation") {
            const res = await api.get(`/api/repositories/${repoId}/documentation`);
            applyDocumentation(res.data.data as DocumentationJob);
          } else if (archDocRef.current) {
            const res = await api.get(
              `/api/repositories/${repoId}/architecture-doc/jobs/${archDocRef.current.jobId}`
            );
            applyArchDoc(res.data.data as ArchDocJob);
          }
        } catch {
          // 404: job not created yet — keep waiting on SSE
        }

        await sleep(2000);
      }
    },
    [repoId, applyAnalysis, applyDocumentation, applyArchDoc]
  );

  const startPipeline = useCallback(async () => {
    if (!repoId || pipelineRef.current) return;

    const run = async () => {
      setError(null);
      setPhase("starting");
      try {
        try {
          const res = await api.post(`/api/repositories/${repoId}/analyze`);
          applyAnalysis(res.data.data as AnalysisJob);
        } catch (err) {
          const e = err as { response?: { status?: number } };
          if (e.response?.status !== 409) throw err;
        }

        setPhase("running");
        await waitForJob("analysis");

        try {
          const res = await api.post(`/api/repositories/${repoId}/document`);
          applyDocumentation(res.data.data as DocumentationJob);
        } catch (err) {
          const e = err as { response?: { status?: number } };
          if (e.response?.status !== 409) throw err;
        }
        await waitForJob("documentation");

        const res = await api.post(`/api/repositories/${repoId}/architecture-doc`);
        const data = res.data.data as {
          docId: string;
          jobId: string;
          status: ArchDocJob["status"];
        };
        applyArchDoc({
          jobId: data.jobId,
          docId: data.docId,
          status: data.status,
          errorMessage: null,
        });
        await waitForJob("archDoc");

        setPhase("docs-ready");
      } catch (err) {
        setError(parseError(err));
        setPhase("error");
      } finally {
        pipelineRef.current = null;
      }
    };

    pipelineRef.current = run();
    await pipelineRef.current;
  }, [repoId, applyAnalysis, applyDocumentation, applyArchDoc, waitForJob]);

  return {
    analysis,
    documentation,
    archDoc,
    phase,
    error,
    startPipeline,
  };
}
