import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// =========================== VIRTUAL LIST LIBRARY ===========================

export interface VirtualListProps<T> {
  data?: T[];
  height: number;
  itemHeight: number;
  itemRender?: (
    item: T,
    index: number,
    style: CSSProperties,
  ) => React.ReactNode;
  children?: React.ReactNode[];
  overscan?: number;
  className?: string;
  style?: CSSProperties;
  onScroll?: (scrollTop: number) => void;
}

function VirtualList<T>({
  data,
  height,
  itemHeight,
  itemRender,
  children,
  overscan = 3,
  className = "",
  style = {},
  onScroll,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Use children if provided, otherwise use data
  const items = children ? React.Children.toArray(children) : data || [];
  const totalHeight = items.length * itemHeight;

  // Calculate the visible range of items
  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight),
  );

  // Apply overscan to render additional items beyond the visible area
  const startIndex = Math.max(0, visibleStartIndex - overscan);
  const endIndex = Math.min(items.length - 1, visibleEndIndex + overscan);

  // Generate the visible items
  const visibleItems = useMemo(() => {
    const renderedItems = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      const offsetTop = i * itemHeight;

      // If using children, clone the React element with positioning styles
      if (children) {
        const child = item as React.ReactElement;
        renderedItems.push(
          React.cloneElement(child, {
            key: child.key || i,
            style: {
              ...child.props.style,
              position: "absolute",
              top: offsetTop,
              height: itemHeight,
              left: 0,
              right: 0,
            },
          }),
        );
      } else if (itemRender && data) {
        // Use the itemRender function for data-driven rendering
        renderedItems.push(
          itemRender(item as T, i, {
            position: "absolute",
            top: offsetTop,
            height: itemHeight,
            left: 0,
            right: 0,
          }),
        );
      }
    }

    return renderedItems;
  }, [items, itemHeight, startIndex, endIndex, itemRender, children, data]);

  // Handle scrolling
  const handleScroll = () => {
    if (containerRef.current) {
      const newScrollTop = containerRef.current.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    }
  };

  // Update scroll position on data or height changes
  useEffect(() => {
    handleScroll();
  }, [items.length, height]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height,
        overflow: "auto",
        position: "relative",
        ...style,
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems}
      </div>
    </div>
  );
}

// Horizontal virtual list implementation
export interface HorizontalVirtualListProps<T> {
  data?: T[];
  width: number;
  itemWidth: number;
  itemRender?: (
    item: T,
    index: number,
    style: CSSProperties,
  ) => React.ReactNode;
  children?: React.ReactNode[];
  height?: string | number;
  overscan?: number;
  className?: string;
  style?: CSSProperties;
  onScroll?: (scrollLeft: number) => void;
}

function HorizontalVirtualList<T>({
  data,
  width,
  itemWidth,
  itemRender,
  children,
  height = "auto",
  overscan = 3,
  className = "",
  style = {},
  onScroll,
}: HorizontalVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Use children if provided, otherwise use data
  const items = children ? React.Children.toArray(children) : data || [];
  const totalWidth = items.length * itemWidth;

  // Calculate the visible range of items
  const visibleStartIndex = Math.floor(scrollLeft / itemWidth);
  const visibleEndIndex = Math.min(
    items.length - 1,
    Math.floor((scrollLeft + width) / itemWidth),
  );

  // Apply overscan to render additional items beyond the visible area
  const startIndex = Math.max(0, visibleStartIndex - overscan);
  const endIndex = Math.min(items.length - 1, visibleEndIndex + overscan);

  // Generate the visible items
  const visibleItems = useMemo(() => {
    const renderedItems = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      const offsetLeft = i * itemWidth;

      // If using children, clone the React element with positioning styles
      if (children) {
        const child = item as React.ReactElement;
        renderedItems.push(
          React.cloneElement(child, {
            key: child.key || i,
            style: {
              ...child.props.style,
              position: "absolute",
              left: offsetLeft,
              width: itemWidth,
              top: 0,
              bottom: 0,
            },
          }),
        );
      } else if (itemRender && data) {
        // Use the itemRender function for data-driven rendering
        renderedItems.push(
          itemRender(item as T, i, {
            position: "absolute",
            left: offsetLeft,
            width: itemWidth,
            top: 0,
            bottom: 0,
          }),
        );
      }
    }

    return renderedItems;
  }, [items, itemWidth, startIndex, endIndex, itemRender, children, data]);

  // Handle scrolling
  const handleScroll = () => {
    if (containerRef.current) {
      const newScrollLeft = containerRef.current.scrollLeft;
      setScrollLeft(newScrollLeft);
      onScroll?.(newScrollLeft);
    }
  };

  // Update scroll position on data or width changes
  useEffect(() => {
    handleScroll();
  }, [items.length, width]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        overflowX: "auto",
        overflowY: "hidden",
        position: "relative",
        ...style,
      }}
      onScroll={handleScroll}
    >
      <div style={{ width: totalWidth, height: "100%", position: "relative" }}>
        {visibleItems}
      </div>
    </div>
  );
}

// Grid virtual list implementation
export interface GridVirtualListProps<T> {
  data?: T[];
  height: number;
  width: number;
  rowHeight: number;
  columnWidth: number;
  columns: number;
  itemRender?: (
    item: T,
    index: number,
    style: CSSProperties,
  ) => React.ReactNode;
  children?: React.ReactNode[];
  overscan?: number;
  className?: string;
  style?: CSSProperties;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
}

function GridVirtualList<T>({
  data,
  height,
  width,
  rowHeight,
  columnWidth,
  columns,
  itemRender,
  children,
  overscan = 1,
  className = "",
  style = {},
  onScroll,
}: GridVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Use children if provided, otherwise use data
  const items = children ? React.Children.toArray(children) : data || [];
  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * rowHeight;
  const totalWidth = columns * columnWidth;

  // Calculate the visible range of rows and columns
  const visibleStartRow = Math.floor(scrollTop / rowHeight);
  const visibleEndRow = Math.min(
    totalRows - 1,
    Math.floor((scrollTop + height) / rowHeight),
  );

  const visibleStartColumn = Math.floor(scrollLeft / columnWidth);
  const visibleEndColumn = Math.min(
    columns - 1,
    Math.floor((scrollLeft + width) / columnWidth),
  );

  // Apply overscan
  const startRow = Math.max(0, visibleStartRow - overscan);
  const endRow = Math.min(totalRows - 1, visibleEndRow + overscan);
  const startColumn = Math.max(0, visibleStartColumn - overscan);
  const endColumn = Math.min(columns - 1, visibleEndColumn + overscan);

  // Generate the visible items
  const visibleItems = useMemo(() => {
    const renderedItems = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startColumn; col <= endColumn; col++) {
        const index = row * columns + col;

        if (index < items.length) {
          const item = items[index];
          const offsetTop = row * rowHeight;
          const offsetLeft = col * columnWidth;

          // If using children, clone the React element with positioning styles
          if (children) {
            const child = item as React.ReactElement;
            renderedItems.push(
              React.cloneElement(child, {
                key: child.key || index,
                style: {
                  ...child.props.style,
                  position: "absolute",
                  top: offsetTop,
                  left: offsetLeft,
                  width: columnWidth,
                  height: rowHeight,
                },
              }),
            );
          } else if (itemRender && data) {
            // Use the itemRender function for data-driven rendering
            renderedItems.push(
              itemRender(item as T, index, {
                position: "absolute",
                top: offsetTop,
                left: offsetLeft,
                width: columnWidth,
                height: rowHeight,
              }),
            );
          }
        }
      }
    }

    return renderedItems;
  }, [
    items,
    rowHeight,
    columnWidth,
    columns,
    startRow,
    endRow,
    startColumn,
    endColumn,
    itemRender,
    children,
    data,
  ]);

  // Handle scrolling
  const handleScroll = () => {
    if (containerRef.current) {
      const newScrollTop = containerRef.current.scrollTop;
      const newScrollLeft = containerRef.current.scrollLeft;
      setScrollTop(newScrollTop);
      setScrollLeft(newScrollLeft);
      onScroll?.(newScrollTop, newScrollLeft);
    }
  };

  // Update scroll position on data or dimensions changes
  useEffect(() => {
    handleScroll();
  }, [items.length, height, width, columns]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height,
        width,
        overflow: "auto",
        position: "relative",
        ...style,
      }}
      onScroll={handleScroll}
    >
      <div
        style={{ height: totalHeight, width: totalWidth, position: "relative" }}
      >
        {visibleItems}
      </div>
    </div>
  );
}

// Helper hook to calculate list dimensions
export function useVirtualListDimensions(
  containerRef: React.RefObject<HTMLElement>,
  itemCount: number,
  itemSize: number,
  direction: "vertical" | "horizontal" = "vertical",
) {
  const [dimensions, setDimensions] = useState({
    containerSize: 0,
    totalSize: itemCount * itemSize,
    visibleStartIndex: 0,
    visibleEndIndex: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerSize =
          direction === "vertical"
            ? containerRef.current.clientHeight
            : containerRef.current.clientWidth;

        const scrollPosition =
          direction === "vertical"
            ? containerRef.current.scrollTop
            : containerRef.current.scrollLeft;

        const totalSize = itemCount * itemSize;
        const visibleStartIndex = Math.floor(scrollPosition / itemSize);
        const visibleEndIndex = Math.min(
          itemCount - 1,
          Math.floor((scrollPosition + containerSize) / itemSize),
        );

        setDimensions({
          containerSize,
          totalSize,
          visibleStartIndex,
          visibleEndIndex,
        });
      }
    };

    updateDimensions();

    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener("scroll", updateDimensions);
      window.addEventListener("resize", updateDimensions);
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener("scroll", updateDimensions);
        window.removeEventListener("resize", updateDimensions);
      }
    };
  }, [containerRef, itemCount, itemSize, direction]);

  return dimensions;
}

// Window-based virtualization hook
export function useWindowVirtualization<T>(
  items: T[],
  itemHeight: number,
  overscan: number = 3,
) {
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0,
  );
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWindowHeight(window.innerHeight);
    const handleScroll = () => setScrollTop(window.scrollY);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.floor((scrollTop + windowHeight) / itemHeight);

  const startIndex = Math.max(0, visibleStartIndex - overscan);
  const endIndex = Math.min(items.length - 1, visibleEndIndex + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight: items.length * itemHeight,
  };
}

// =========================== EXAMPLE USAGE ===========================

// Example data
const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    text: `Item ${index}`,
    height: 50 + Math.floor(Math.random() * 50), // Variable height for demo
    color: `hsl(${index % 360}, 70%, 80%)`,
  }));
};

// Children-based example
export const ChildrenExample = () => {
  const items = generateItems(5000);

  return (
    <div>
      <h2>Children-based Virtual List (5,000 items)</h2>
      <VirtualList height={400} itemHeight={50}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              backgroundColor: item.color,
              padding: "10px",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
            }}
          >
            {item.text} (children approach - index: {index})
          </div>
        ))}
      </VirtualList>
    </div>
  );
};

// Horizontal children example
export const HorizontalChildrenExample = () => {
  const items = generateItems(300);

  return (
    <div>
      <h2>Horizontal Children List (300 items)</h2>
      <HorizontalVirtualList width={800} height={100} itemWidth={200}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              backgroundColor: item.color,
              padding: "10px",
              borderRight: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.text}
          </div>
        ))}
      </HorizontalVirtualList>
    </div>
  );
};

// Grid children example
export const GridChildrenExample = () => {
  const items = generateItems(2000);
  const columns = 4;

  return (
    <div>
      <h2>Grid Children List (2,000 items)</h2>
      <GridVirtualList
        height={500}
        width={800}
        rowHeight={100}
        columnWidth={200}
        columns={columns}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              backgroundColor: item.color,
              padding: "10px",
              border: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div>{item.text}</div>
            <div>Index: {index}</div>
          </div>
        ))}
      </GridVirtualList>
    </div>
  );
};
export const BasicExample = () => {
  const items = generateItems(10000);

  return (
    <div>
      <h2>ItemRender Prop Approach (10,000 items)</h2>
      <VirtualList
        data={items}
        height={400}
        itemHeight={50}
        itemRender={(item, index, style) => (
          <div
            key={item.id}
            style={{
              ...style,
              backgroundColor: item.color,
              padding: "10px",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
            }}
          >
            {item.text} (index: {index})
          </div>
        )}
      />
    </div>
  );
};

// Horizontal list example
export const HorizontalExample = () => {
  const items = generateItems(500);

  return (
    <div>
      <h2>Horizontal List (500 items)</h2>
      <HorizontalVirtualList
        data={items}
        width={800}
        height={100}
        itemWidth={200}
        itemRender={(item, index, style) => (
          <div
            key={item.id}
            style={{
              ...style,
              backgroundColor: item.color,
              padding: "10px",
              borderRight: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.text}
          </div>
        )}
      />
    </div>
  );
};

// Grid list example
export const GridExample = () => {
  const items = generateItems(5000);
  const columns = 5;

  return (
    <div>
      <h2>Grid List (5,000 items)</h2>
      <GridVirtualList
        data={items}
        height={500}
        width={800}
        rowHeight={100}
        columnWidth={160}
        columns={columns}
        itemRender={(item, index, style) => (
          <div
            key={item.id}
            style={{
              ...style,
              backgroundColor: item.color,
              padding: "10px",
              border: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div>{item.text}</div>
            <div>Index: {index}</div>
          </div>
        )}
      />
    </div>
  );
};

// Variable height items example using a custom renderer
export const VariableHeightExample = () => {
  const items = generateItems(1000);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Get the height for a specific item (expanded or default)
  const getItemHeight = (index: number) => {
    return expandedItems.has(index) ? 150 : 60;
  };

  // Calculate total height for all items
  const totalHeight = items.reduce(
    (sum, _, index) => sum + getItemHeight(index),
    0,
  );

  // Custom renderer that handles variable heights
  const renderVariableHeightItem = (startIndex: number, endIndex: number) => {
    const renderedItems = [];
    let currentOffset = 0;

    // Calculate offset for each item based on all previous item heights
    for (let i = 0; i < startIndex; i++) {
      currentOffset += getItemHeight(i);
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      const itemHeight = getItemHeight(i);

      renderedItems.push(
        <div
          key={item?.id}
          style={{
            position: "absolute",
            top: currentOffset,
            left: 0,
            right: 0,
            height: itemHeight,
            backgroundColor: item?.color,
            padding: "10px",
            borderBottom: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={() => {
            const newExpanded = new Set(expandedItems);
            if (expandedItems.has(i)) {
              newExpanded.delete(i);
            } else {
              newExpanded.add(i);
            }
            setExpandedItems(newExpanded);
          }}
        >
          <div style={{ fontWeight: "bold" }}>{item?.text}</div>
          {expandedItems.has(i) && (
            <div style={{ marginTop: "10px" }}>
              Additional content that displays when expanded. This demonstrates
              the variable height capability.
            </div>
          )}
        </div>,
      );

      currentOffset += itemHeight;
    }

    return renderedItems;
  };

  // Custom virtualization implementation for variable heights
  const CustomVariableHeightList = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const containerHeight = 400;

    // Find visible range by accumulating heights
    const getVisibleRange = () => {
      let currentHeight = 0;
      let startIndex = 0;
      let endIndex = 0;

      // Find start index
      for (let i = 0; i < items.length; i++) {
        const itemHeight = getItemHeight(i);
        if (currentHeight + itemHeight > scrollTop) {
          startIndex = i;
          break;
        }
        currentHeight += itemHeight;
      }

      // Find end index
      currentHeight = 0;
      for (let i = 0; i < items.length; i++) {
        const itemHeight = getItemHeight(i);
        currentHeight += itemHeight;
        if (currentHeight > scrollTop + containerHeight) {
          endIndex = i;
          break;
        }

        if (i === items.length - 1) {
          endIndex = i;
        }
      }

      // Add overscan
      startIndex = Math.max(0, startIndex - 3);
      endIndex = Math.min(items.length - 1, endIndex + 3);

      return { startIndex, endIndex };
    };

    const { startIndex, endIndex } = getVisibleRange();

    return (
      <div
        ref={containerRef}
        style={{
          height: containerHeight,
          overflow: "auto",
          position: "relative",
          border: "1px solid #ccc",
        }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {renderVariableHeightItem(startIndex, endIndex)}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Variable Height List (Click items to expand)</h2>
      <CustomVariableHeightList />
    </div>
  );
};

// Main component to showcase examples
const VirtualListExamples = () => {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1>React Virtual List Examples</h1>
      <p>
        These examples demonstrate different virtual list implementations. Each
        list efficiently renders only the visible items, making it possible to
        handle large data sets with minimal performance impact.
      </p>
      <p>
        <strong>Two API approaches:</strong>
      </p>
      <ul>
        <li>
          <strong>Children Prop:</strong> Pass JSX elements as children (more
          React-idiomatic)
        </li>
        <li>
          <strong>ItemRender Prop:</strong> Use a render function with data
          array (more performant for dynamic data)
        </li>
      </ul>

      <ChildrenExample />
      <BasicExample />
      <HorizontalChildrenExample />
      <HorizontalExample />
      <GridChildrenExample />
      <GridExample />
      <VariableHeightExample />
    </div>
  );
};

// Export all components
export {
  VirtualList,
  HorizontalVirtualList,
  GridVirtualList,
  VirtualListExamples,
};

export default VirtualList;
