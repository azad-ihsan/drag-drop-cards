import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const initialCards = [
  { id: 1, name: "Cristiano Ronaldo", img: "../src/assets/1.jpg" },
  { id: 2, name: "Lionel Messi", img: "../src/assets/2.jpg" },
  { id: 3, name: "Kylian Mbappé", img: "../src/assets/3.jpg" },
  { id: 4, name: "Erling Haaland", img: "../src/assets/4.jpg" },
  { id: 5, name: "Kevin De Bruyne", img: "../src/assets/5.jpg" },
  { id: 6, name: "Mohamed Salah", img: "../src/assets/6.jpg" },
  { id: 7, name: "Neymar Jr.", img: "../src/assets/7.jpg" },
  { id: 8, name: "Jude Bellingham", img: "../src/assets/8.jpg" },
  { id: 9, name: "Robert Lewandowski", img: "../src/assets/9.jpg" },
  { id: 10, name: "Vinícius Júnior", img: "../src/assets/10.jpg" },
];

const App = () => {
  const [cards, setCards] = useState(initialCards);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const containerRef = useRef(null);
  const cardRefs = useRef({});

  const handleMouseDown = (e, index) => {
    e.preventDefault();
    setDraggingIndex(index);
    const rect = containerRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredCardId(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && draggingIndex !== null) {
        e.preventDefault();
        resetDrag();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [draggingIndex]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setDragPos({ x: mouseX, y: mouseY });

    let foundHover = null;

    cards.forEach((card, idx) => {
      if (idx === draggingIndex) return;
      const cardElem = cardRefs.current[card.id];
      if (!cardElem) return;

      const r = cardElem.getBoundingClientRect();
      const left = r.left - rect.left;
      const top = r.top - rect.top;
      const right = left + r.width;
      const bottom = top + r.height;

      if (
        mouseX >= left &&
        mouseX <= right &&
        mouseY >= top &&
        mouseY <= bottom
      ) {
        foundHover = card.id;
      }
    });

    setHoveredCardId(foundHover);
  };

  const handleMouseUp = (e) => {
    if (draggingIndex === null) return;
    if (!containerRef.current) {
      resetDrag();
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let dropIndex = null;

    cards.forEach((card, idx) => {
      if (idx === draggingIndex) return;
      const cardElem = cardRefs.current[card.id];
      if (!cardElem) return;

      const r = cardElem.getBoundingClientRect();
      const left = r.left - rect.left;
      const top = r.top - rect.top;
      const right = left + r.width;
      const bottom = top + r.height;

      if (
        mouseX >= left &&
        mouseX <= right &&
        mouseY >= top &&
        mouseY <= bottom
      ) {
        dropIndex = idx;
      }
    });

    if (dropIndex !== null && dropIndex !== draggingIndex) {
      const newCards = [...cards];
      const [dragged] = newCards.splice(draggingIndex, 1);
      newCards.splice(dropIndex, 0, dragged);
      setCards(newCards);
    }

    resetDrag();
  };

  const resetDrag = () => {
    setDraggingIndex(null);
    setHoveredCardId(null);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="relative border border-[rgba(255,255,255,0.5)] hover:border-[rgba(255,255,255,0.8)] transition-all duration-500  grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 p-8 gap-4 rounded-xl"
      style={{ height: "auto" }}
    >
      {cards.map((card, index) => {
        const isDragging = draggingIndex === index;
        const isHovered = hoveredCardId === card.id;

        return (
          <motion.div
            key={card.id}
            ref={(el) => {
              if (el) cardRefs.current[card.id] = el;
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
            layout
            className="flex flex-col justify-end items-center w-42 h-56 relative rounded-md overflow-hidden border shadow-sm cursor-grab select-none transition-all duration-300 ease-in-out"
            style={{
              border: isHovered
                ? "2px solid rgba(255,255,255,0.8)"
                : "2px solid rgba(255,255,255,0.5)",
              visibility: isDragging ? "hidden" : "visible",
              userSelect: "none",
            }}
            whileTap={{ cursor: "grabbing" }}
          >
            <h2 className="bg-white/40 h-8 w-8 flex justify-center items-center font-semibold absolute top-2 left-2 z-20 text-black rounded-full">
              {index + 1}
            </h2>
            <img
              src={card.img}
              alt={card.name}
              className="w-full h-full object-cover absolute inset-0"
              draggable={false}
            />
            <h2 className="text-black font-semibold px-2 py-1 rounded-sm mb-2 z-10 bg-white/90 select-none pointer-events-none text-center leading-3.5 mx-4">
              {card.name}
            </h2>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {draggingIndex !== null && (
          <motion.div
            key="dragged"
            className="w-42 h-56 rounded-md shadow-lg cursor-grabbing pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: dragPos.y - 112,
              left: dragPos.x - 75,
            }}
            transition={{ type: "tween", duration: 0.1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              backgroundColor: "white",
              zIndex: 1000,
              width: "168px",
              height: "224px",
              borderRadius: "0.375rem",
              boxShadow: "0 10px 15px rgba(0,0,0,0.3)",
              userSelect: "none",
            }}
            drag={false}
          >
            <img
              src={cards[draggingIndex].img}
              alt={cards[draggingIndex].name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "inherit",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
            <h2
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                padding: "0.25rem 0.5rem",
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "0.125rem",
                fontWeight: "600",
                color: "black",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {cards[draggingIndex].name}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
