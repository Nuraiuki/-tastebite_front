export default function Container({ children, className = "" }) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 ${className}`}>
        {children}
      </div>
    );
  }
  