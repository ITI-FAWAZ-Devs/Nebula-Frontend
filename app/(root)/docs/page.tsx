import { ArchitectureWiki } from "@/components/docs/ArchitectureWiki";
import { DUMMY_ARCH_DOC } from "@/components/docs/dummy-data";

export default function DocsPage() {
  return (
    <div className="h-screen overflow-hidden">
      <ArchitectureWiki data={DUMMY_ARCH_DOC.data} repoName="product-list-app" />
    </div>
  );
}
