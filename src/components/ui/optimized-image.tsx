"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  fallback?: string
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  fallback = "/placeholder-image.jpg",
  placeholder = "empty",
  blurDataURL,
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    setHasError(true)
    setImgSrc(fallback)
    setIsLoading(false)
  }

  const handleLoadComplete = () => {
    setIsLoading(false)
  }

  const imageProps: ImageProps = {
    src: imgSrc,
    alt: alt || "",
    onError: handleError,
    onLoadingComplete: handleLoadComplete,
    className: cn(
      "transition-opacity duration-300",
      isLoading && "opacity-0",
      !isLoading && "opacity-100",
      className
    ),
    ...props,
  }

  if (placeholder === "blur" && blurDataURL) {
    imageProps.placeholder = "blur"
    imageProps.blurDataURL = blurDataURL
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image {...imageProps} alt={alt || ""} />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">جاري التحميل...</div>
        </div>
      )}
      {hasError && !isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">تعذر تحميل الصورة</div>
        </div>
      )}
    </div>
  )
}