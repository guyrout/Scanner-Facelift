export interface InboxMessage {
  id: string;
  title: string;
  preview: string;
  body: string;
  dateLabel: string;
  timeLabel: string;
  avatarFirstName: string;
  avatarLastName: string;
}

/** Mock inbox — Figma UI-Refresh-2026 Q2 Messages (4383:208127) */
export const MOCK_MESSAGES: InboxMessage[] = [
  {
    id: "m0",
    title: "ITP Messages Title no 0",
    preview: "ITP Messages Content no 0",
    body: `ITP Messages Content is here: 

Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
    dateLabel: "07/04/2026",
    timeLabel: "9:52 PM",
    avatarFirstName: "I",
    avatarLastName: "T",
  },
  {
    id: "m1",
    title: "Lab case shipped",
    preview: "Your restorative case has left the facility.",
    body: "The case referenced in your order dashboard has shipped. Tracking details will follow in a separate notification.",
    dateLabel: "05/01/2026",
    timeLabel: "2:15 PM",
    avatarFirstName: "L",
    avatarLastName: "B",
  },
  {
    id: "m2",
    title: "Account verification",
    preview: "Please confirm your practice contact email.",
    body: "We need a quick confirmation of your primary contact email for compliance. Reply to this thread or update settings.",
    dateLabel: "04/28/2026",
    timeLabel: "8:00 AM",
    avatarFirstName: "A",
    avatarLastName: "L",
  },
];

export function filterMessages(messages: InboxMessage[], query: string): InboxMessage[] {
  const q = query.trim().toLowerCase();
  if (!q) return messages;
  return messages.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.preview.toLowerCase().includes(q) ||
      m.body.toLowerCase().includes(q)
  );
}
