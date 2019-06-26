module.exports = function(self) {
  self.addEventListener("message", function(e) {
    const { action, payload } = e.data;
    switch (action) {
      case "PROCESS_ITEM": {
        const response = processedItems(payload);
        self.postMessage({ action: "ITEM_PROCESSED", payload: response });
      }
    }
    //
  });

  function processedItems(items) {
    const lineBreak = "__LINEBREAK__";
    const deleteChars = "__DELETE__";
    const delay = "__DELAY__";

    return items.map(part => {
      if (part.trim() === lineBreak) {
        return { type: { displayName: "LineBreak" } };
      }

      if (part.trim().includes(deleteChars)) {
        const charsCount = part.trim().substring(10, part.trim().length);
        return {
          type: { displayName: "Delete" },
          props: { characters: Number(charsCount) }
        };
      }

      if (part.trim().includes(delay)) {
        const timing = part.trim().substring(9, part.trim().length) || 0;
        return {
          type: { displayName: "Delay" },
          props: { ms: Number(timing) }
        };
      }
      return part;
    });
  }
};
