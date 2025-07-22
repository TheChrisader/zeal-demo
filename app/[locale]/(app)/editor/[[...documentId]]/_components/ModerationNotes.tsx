import { useQuery } from "@tanstack/react-query";
import { fetchById } from "../_utils/composites";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { IDraft } from "@/types/draft.type";
import { useState } from "react";

interface ExpandableNoteProps {
  note: string;
  truncateLength?: number;
}

const ExpandableNote: React.FC<ExpandableNoteProps> = ({
  note,
  truncateLength = 150,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const canBeTruncated = note.length > truncateLength;

  const toggleExpanded = () => {
    if (canBeTruncated) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <li
      onClick={toggleExpanded}
      className={canBeTruncated ? "cursor-pointer py-1" : "py-1"}
    >
      <p className="inline text-gray-800">
        {canBeTruncated && !isExpanded
          ? `${note.substring(0, truncateLength)}...`
          : note}
      </p>
      {canBeTruncated && (
        <button className="ml-1 text-xs font-medium text-gray-500 hover:underline">
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </li>
  );
};

interface ModerationNotesProps {}

const ModerationNotes = ({}: ModerationNotesProps) => {
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);

  const { data: documentData } = useQuery<IDraft | null, Error>({
    queryKey: ["document", activeDocumentId],
    queryFn: () => fetchById(activeDocumentId as string),
    enabled: !!activeDocumentId,
  });

  if (
    !documentData ||
    !("moderationStatus" in documentData) ||
    documentData.moderationStatus !== "rejected" ||
    !documentData.moderationNotes ||
    documentData.moderationNotes.length === 0
  ) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">Moderation Notes</h3>
      <div className="border-l-2 border-red-500 px-3 py-2">
        <ul className="list-inside list-disc space-y-1 text-sm">
          {documentData.moderationNotes.map((note, index) => (
            <ExpandableNote key={index} note={note} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModerationNotes;
