"use client";

import { motion, useTransform, useMotionValue, useSpring } from "motion/react";

export type TooltipItem = {
  id: string | number;
  name: string;
  designation: string;
  image: string;
};

const TooltipAvatar = ({ item }: { item: TooltipItem }) => {
  const x = useMotionValue(0);

  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), {
    stiffness: 100,
    damping: 15,
  });

  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), {
    stiffness: 100,
    damping: 15,
  });

  return (
    <div className="group relative">
      <motion.div
        style={{ translateX, rotate }}
        className="pointer-events-none absolute -top-16 left-1/2 z-50 hidden -translate-x-1/2 flex-col items-center rounded-md bg-primary px-4 py-2 text-xs shadow-xl group-hover:flex"
      >
        <p className="whitespace-nowrap text-sm font-medium text-white">
          {item.name}
        </p>
        <p className="whitespace-nowrap text-xs text-white/60">
          {item.designation}
        </p>
      </motion.div>

      <img
        onMouseMove={(e) =>
          x.set(e.nativeEvent.offsetX - e.currentTarget.offsetWidth / 2)
        }
        src={item.image}
        alt={item.name}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full border-2 border-white dark:border-[#0F0F13] object-cover object-top transition duration-500 group-hover:z-30 group-hover:scale-105"
      />
    </div>
  );
};

export function AnimatedTooltipGroup({ items }: { items: TooltipItem[] }) {
  return (
    <div className="flex items-center -space-x-2">
      {items.map((item) => (
        <TooltipAvatar key={item.id} item={item} />
      ))}
    </div>
  );
}

export default AnimatedTooltipGroup;
