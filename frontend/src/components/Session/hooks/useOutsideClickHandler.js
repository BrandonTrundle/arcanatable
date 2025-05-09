import { useEffect } from "react";

export const useOutsideClickHandler = (className, onClose) => {
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const target = document.querySelector(`.${className}`);
      if (target && target.contains(e.target)) return;
      onClose();
    };

    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [className, onClose]);
};
