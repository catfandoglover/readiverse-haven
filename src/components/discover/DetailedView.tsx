
  const renderHeader = () => (
    <header className={cn(
      "bg-transparent fixed top-0 left-0 right-0 z-10 transition-all duration-200",
      shouldBlurHeader && "backdrop-blur-md bg-[#E9E7E2]/80"
    )}>
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={handleBack}
          className={cn(
            "h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-[#2A282A]/10 transition-colors",
            !shouldBlurHeader ? "text-white hover:bg-white/10" : "text-[#2A282A] hover:bg-[#2A282A]/10"
          )}
          aria-label="Back to Discover"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <h1 className={cn(
            "font-oxanium text-sm uppercase tracking-wider font-bold",
            !shouldBlurHeader ? "text-white" : "text-[#2A282A]"
          )}>
            {combinedData?.title || combinedData?.name || type.toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={cn(
              "h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-[#2A282A]/10 transition-colors",
              !shouldBlurHeader ? "text-white hover:bg-white/10" : "text-[#2A282A] hover:bg-[#2A282A]/10"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={toggleFavorite}
          >
            <Star 
              className="h-5 w-5" 
              fill={isFavorite ? "#EFFE91" : (!shouldBlurHeader ? "white" : "none")} 
              stroke={!shouldBlurHeader ? "white" : "#2A282A"}
            />
          </button>
          <button
            className={cn(
              "h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-[#2A282A]/10 transition-colors",
              !shouldBlurHeader ? "text-white hover:bg-white/10" : "text-[#2A282A] hover:bg-[#2A282A]/10"
            )}
            aria-label="Share"
            onClick={handleShare}
          >
            <Share 
              className="h-5 w-5" 
              stroke={!shouldBlurHeader ? "white" : "#2A282A"}
            />
          </button>
        </div>
      </div>
    </header>
  );
