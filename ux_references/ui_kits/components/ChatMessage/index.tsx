
/**
 * ChatMessage — bolha de conversa.
 * Props: role (user|assistant|system), avatar, name, timestamp, children.
 */

interface ChatMessageProps {
  role?: "user" | "assistant" | "system";
  name?: React.ReactNode;
  avatar?: string; // image url
  avatarIcon?: string; // fallback icon name
  timestamp?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  confidence?: "high" | "medium" | "low";
  className?: string;
}

function ChatMessage({
  role = "assistant", name, avatar, avatarIcon,
  timestamp, children, actions, confidence, className = "",
}: ChatMessageProps) {
  const IconCmp = (window as any).Icon;
  const ConfIndicator = (window as any).ConfidenceIndicator;
  const cls = ["grd-cm", `grd-cm-${role}`, className].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <div className="grd-cm-avatar">
        {avatar
          ? <img src={avatar} alt="" />
          : IconCmp && <IconCmp name={avatarIcon ?? (role === "user" ? "user" : role === "system" ? "info" : "bot")} size={16} />}
      </div>
      <div className="grd-cm-bubble">
        <div className="grd-cm-head">
          {name && <span className="grd-cm-name">{name}</span>}
          {timestamp && <span className="grd-cm-ts">{timestamp}</span>}
        </div>
        <div className="grd-cm-body">{children}</div>
        {(confidence || actions) && (
          <div className="grd-cm-foot">
            {confidence && ConfIndicator && <ConfIndicator level={confidence} size="sm" />}
            {actions && <div className="grd-cm-actions">{actions}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
ChatMessage.displayName = "ChatMessage";
(window as any).ChatMessage = ChatMessage;
