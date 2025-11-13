import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface SwipeableTasksContainerProps {
  currentDate: Date;
  direction: number;
  handlers: ReturnType<typeof import("react-swipeable").useSwipeable>;
  children: ReactNode;
}

const SwipeableTasksContainer = ({
  currentDate,
  direction,
  handlers,
  children,
}: SwipeableTasksContainerProps) => {
  return (
    <div
      {...handlers}
      className="bg-background flex-1 px-4 flex flex-col relative"
    >
      <div className="-mt-10 relative flex-1">
        <div className="absolute inset-0 overflow-y-scroll">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentDate.toISOString()}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir * 300,
                  opacity: 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                },
                exit: (dir: number) => ({
                  x: dir * -300,
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SwipeableTasksContainer;
