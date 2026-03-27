import { Node, mergeAttributes } from "@tiptap/core";
import katex from "katex";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      insertMath: (latex: string) => ReturnType;
    };
  }
}

export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex") ?? "",
        renderHTML: (attributes) => ({
          "data-latex": attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-math-inline]",
        getAttrs: (element) => ({
          latex:
            (element as HTMLElement).getAttribute("data-latex") ??
            (element as HTMLElement).textContent ??
            "",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-math-inline": "" }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      dom.setAttribute("data-math-inline", "");
      dom.setAttribute("data-latex", node.attrs.latex);
      dom.style.display = "inline-block";
      dom.style.cursor = "default";
      dom.innerHTML = katex.renderToString(node.attrs.latex as string, {
        throwOnError: false,
      });
      return { dom };
    };
  },

  addCommands() {
    return {
      insertMath:
        (latex: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          });
        },
    };
  },
});
