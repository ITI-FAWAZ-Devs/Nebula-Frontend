"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, Trash2, ChevronDown, ChevronUp, UserPlus, FolderPlus, X } from "lucide-react";
import {
  useOrgTeamsQuery,
  useCreateOrgTeamMutation,
  useDeleteOrgTeamMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useAddTeamRepositoryMutation,
  useRemoveTeamRepositoryMutation,
  useOrgMembersQuery,
  useOrgRepositoriesQuery,
  Team,
} from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiGithub } from "react-icons/fi";

interface TeamsTabProps {
  orgId: string;
  canManage: boolean;
}

function TeamPanel({ team, orgId, canManage }: { team: Team; orgId: string; canManage: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [addMemberId, setAddMemberId] = useState("");
  const [addRepoId, setAddRepoId] = useState("");

  const { data: orgMembers } = useOrgMembersQuery(orgId);
  const { data: orgRepos } = useOrgRepositoriesQuery(orgId);

  const addMember = useAddTeamMemberMutation(orgId, team.id);
  const removeMember = useRemoveTeamMemberMutation(orgId, team.id);
  const addRepo = useAddTeamRepositoryMutation(orgId, team.id);
  const removeRepo = useRemoveTeamRepositoryMutation(orgId, team.id);

  const teamMemberUserIds = new Set((team.members ?? []).map((m) => m.userId));
  const teamRepoIds = new Set((team.repositories ?? []).map((r) => r.repositoryId));

  const availableMembers = (orgMembers ?? []).filter(
    (m) => m.userId && !teamMemberUserIds.has(m.userId)
  );
  const availableRepos = (orgRepos ?? []).filter((r) => !teamRepoIds.has(r.id));

  const handleAddMember = async () => {
    if (!addMemberId) return;
    try {
      await addMember.mutateAsync(addMemberId);
      setAddMemberId("");
      toast.success("Member added to team");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || "Failed to add member");
    }
  };

  const handleRemoveMember = (userId: string) => {
    toast.promise(removeMember.mutateAsync(userId), {
      loading: "Removing member...",
      success: "Member removed",
      error: (err: unknown) => {
        const message = err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        return message || "Failed to remove member";
      },
    });
  };

  const handleAddRepo = async () => {
    if (!addRepoId) return;
    try {
      await addRepo.mutateAsync(addRepoId);
      setAddRepoId("");
      toast.success("Repository added to team");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || "Failed to add repository");
    }
  };

  const handleRemoveRepo = (repositoryId: string) => {
    toast.promise(removeRepo.mutateAsync(repositoryId), {
      loading: "Removing repository...",
      success: "Repository removed",
      error: (err: unknown) => {
        const message = err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        return message || "Failed to remove repository";
      },
    });
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/2 overflow-hidden">
      {/* Team header row */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-white/50" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{team.name}</p>
            <p className="text-[11px] text-white/40 font-mono">
              {team._count?.members ?? team.members?.length ?? 0} member{(team._count?.members ?? team.members?.length ?? 0) !== 1 ? "s" : ""} •{" "}
              {team._count?.repositories ?? team.repositories?.length ?? 0} repo{(team._count?.repositories ?? team.repositories?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="h-8 px-3 text-xs text-white/50 hover:text-white hover:bg-white/5 gap-1 cursor-pointer"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Collapse" : "Manage"}
          </Button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-5">
          {/* Members section */}
          <div>
            <p className="text-xs font-semibold text-white/70 mb-3 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" /> Members
            </p>

            <div className="space-y-2 mb-3">
              {(team.members ?? []).length === 0 && (
                <p className="text-[11px] text-white/30 font-mono">No members yet.</p>
              )}
              {(team.members ?? []).map((m) => (
                <div key={m.userId} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-6 w-6">
                      {m.user.avatar && <AvatarImage src={m.user.avatar} />}
                      <AvatarFallback className="text-[9px] bg-white/5 text-white/60">
                        {(m.user.fullName || m.user.email).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-white/80">{m.user.fullName || m.user.email}</span>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(m.userId)}
                      disabled={removeMember.isPending}
                      className="h-6 w-6 rounded text-white/20 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {canManage && availableMembers.length > 0 && (
              <div className="flex gap-2">
                <Select value={addMemberId} onValueChange={(v) => setAddMemberId(v ?? "")}>
                  <SelectTrigger className="flex-1 h-8 text-xs bg-black/30 border-white/10 text-white">
                    <SelectValue placeholder="Pick a member to add..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10">
                    {availableMembers.map((m) => (
                      <SelectItem key={m.userId} value={m.userId!} className="text-xs text-white/80 focus:bg-white/5 focus:text-white">
                        {m.user?.fullName || m.user?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleAddMember}
                  disabled={!addMemberId || addMember.isPending}
                  className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-white cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Repositories section */}
          <div>
            <p className="text-xs font-semibold text-white/70 mb-3 flex items-center gap-2">
              <FiGithub className="h-3.5 w-3.5" /> Repositories
            </p>

            <div className="space-y-2 mb-3">
              {(team.repositories ?? []).length === 0 && (
                <p className="text-[11px] text-white/30 font-mono">No repositories assigned.</p>
              )}
              {(team.repositories ?? []).map((r) => (
                <div key={r.repositoryId} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2">
                    <FiGithub className="h-3.5 w-3.5 text-white/40 shrink-0" />
                    <span className="text-xs text-white/80">
                      {r.repository.owner}/{r.repository.name}
                    </span>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRepo(r.repositoryId)}
                      disabled={removeRepo.isPending}
                      className="h-6 w-6 rounded text-white/20 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {canManage && availableRepos.length > 0 && (
              <div className="flex gap-2">
                <Select value={addRepoId} onValueChange={(v) => setAddRepoId(v ?? "")}>
                  <SelectTrigger className="flex-1 h-8 text-xs bg-black/30 border-white/10 text-white">
                    <SelectValue placeholder="Pick a repository to add..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10">
                    {availableRepos.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs text-white/80 focus:bg-white/5 focus:text-white">
                        {r.owner}/{r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleAddRepo}
                  disabled={!addRepoId || addRepo.isPending}
                  className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-white cursor-pointer"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TeamsTab({ orgId, canManage }: TeamsTabProps) {
  const { data: teams, isLoading } = useOrgTeamsQuery(orgId);
  const createMutation = useCreateOrgTeamMutation(orgId);
  const deleteMutation = useDeleteOrgTeamMutation(orgId);

  const [newTeamName, setNewTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setIsCreating(true);
    try {
      await createMutation.mutateAsync(newTeamName.trim());
      setNewTeamName("");
      toast.success(`Team "${newTeamName}" created`);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || "Failed to create team");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (team: Team) => {
    toast.promise(deleteMutation.mutateAsync(team.id), {
      loading: `Deleting team "${team.name}"...`,
      success: "Team deleted",
      error: (err: unknown) => {
        const message = err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        return message || "Failed to delete team";
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Teams</h3>
          <p className="text-[11px] text-white/40 mt-0.5">
            Group members into teams and assign per-repository permissions.
          </p>
        </div>
      </div>

      {canManage && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="New team name..."
            className="bg-black/40 border-white/10 text-white placeholder:text-white/25 text-xs h-9 flex-1"
          />
          <Button
            type="submit"
            disabled={!newTeamName.trim() || isCreating}
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Team
          </Button>
        </form>
      )}

      {isLoading && (
        <div className="text-white/40 text-xs font-mono animate-pulse py-6 text-center">Loading teams...</div>
      )}

      {!isLoading && (!teams || teams.length === 0) && (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-white/5 bg-white/2 rounded-xl">
          <Users className="h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No teams yet. Create a team to group members.</p>
        </div>
      )}

      {teams && teams.length > 0 && (
        <div className="space-y-2">
          {teams.map((team) => (
            <div key={team.id} className="relative group">
              <TeamPanel team={team} orgId={orgId} canManage={canManage} />
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(team)}
                  disabled={deleteMutation.isPending}
                  className="absolute top-3 right-24 h-7 w-7 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
