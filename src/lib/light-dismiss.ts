/**
 * `closedby="any"` by hand, for a browser that lacks it (Safari, as of
 * writing). A modal <dialog> with that attribute closes on a click on its
 * shade (::backdrop), whose pointer events land on the dialog itself: the
 * press and the click both outside the dialog's box, by pointer position, the
 * way the browsers that have `closedby` do it. So a press on its padding, or
 * a drag that starts inside (a text selection) and ends on the shade, does
 * not count. It closes on the click, not on the release before it: closed
 * any earlier, the click would land on whatever lies under the shade.
 * Imported by every script that opens such a dialog; a module runs once, so
 * the listeners are added once.
 */
if (!("closedBy" in HTMLDialogElement.prototype)) {
  const shaded = (e: MouseEvent) => {
    const dialog = e.target;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return null;
    if (dialog.getAttribute("closedby") !== "any") return null;
    const r = dialog.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    return outside ? dialog : null;
  };

  let pressed: HTMLDialogElement | null = null;
  document.addEventListener("pointerdown", (e) => (pressed = shaded(e)));
  document.addEventListener("pointercancel", () => (pressed = null));
  document.addEventListener("click", (e) => {
    if (pressed && shaded(e) === pressed) pressed.close();
    pressed = null;
  });
}
