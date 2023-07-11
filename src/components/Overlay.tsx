import type { Component } from "solid-js";

const Overlay: Component<{ children: any }> = ({ children }) => {
  return (
    <div class="fixed inset-0 w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
};

export default Overlay;
