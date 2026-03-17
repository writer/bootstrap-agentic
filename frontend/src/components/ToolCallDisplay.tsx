import { Message } from "../api";

interface Props {
  message: Message;
}

export default function ToolCallDisplay({ message }: Props) {
  return (
    <div className="message tool">
      <div className="tool-label">Tool: {message.tool_name || "unknown"}</div>
      <div>{message.content}</div>
    </div>
  );
}
