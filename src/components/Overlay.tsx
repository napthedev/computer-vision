import type { Component, JSX } from "solid-js";

const Overlay: Component<{ children: JSX.Element }> = ({ children }) => {
  return (
    <div class="fixed inset-0 w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
};

export default Overlay;
