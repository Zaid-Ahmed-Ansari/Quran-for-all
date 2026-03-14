import React, { ReactNode } from "react";

/**
 * Splits text by <i>...</i> tags and returns an array of React elements:
 * - Chunks inside <i>...</i> are rendered with fontStyle: 'italic'.
 * - All other chunks are rendered as normal text.
 * Each element has a unique key (keyPrefix + index).
 */
export function renderFormattedText(
  text: string,
  keyPrefix: string = "fmt"
): ReactNode[] {
  if (text == null || text === "") {
    return [<span key={`${keyPrefix}-0`} />];
  }
  const parts = text.split(/(<i>.*?<\/i>)/g);
  return parts.map((chunk, i) => {
    const key = `${keyPrefix}-${i}`;
    if (chunk.startsWith("<i>") && chunk.endsWith("</i>")) {
      const inner = chunk.slice(3, -4);
      return (
        <span key={key} style={{ fontStyle: "italic" }}>
          {inner}
        </span>
      );
    }
    return <span key={key}>{chunk}</span>;
  });
}

