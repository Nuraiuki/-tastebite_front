export function Card({ children, className = "" }) {
    return (
      <div
        className={`
          rounded-2xl shadow-sm overflow-hidden bg-white
          hover:shadow-xl transition-shadow duration-300
          cursor-pointer group
          ${className}
        `}
      >
        {children}
      </div>
    );
  }
  
  export function CardContent({ children, className = "" }) {
    return <div className={`p-4 ${className}`}>{children}</div>;
  }
  