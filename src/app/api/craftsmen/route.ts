import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const profession = url.searchParams.get("profession") || ""
    const location = url.searchParams.get("location") || ""
    const minRating = url.searchParams.get("minRating") ? parseFloat(url.searchParams.get("minRating")!) : 0
    const maxPrice = url.searchParams.get("maxPrice") ? parseFloat(url.searchParams.get("maxPrice")!) : Infinity
    const minPrice = url.searchParams.get("minPrice") ? parseFloat(url.searchParams.get("minPrice")!) : 0
    const sortBy = url.searchParams.get("sortBy") || "rating"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")

    const skip = (page - 1) * limit

    // Build where clause
    let whereClause: any = {
      isApproved: true,
      user: {
        isBlocked: false
      }
    }

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { profession: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    if (profession) {
      whereClause.profession = { contains: profession, mode: "insensitive" }
    }

    if (location) {
      whereClause.user = {
        ...whereClause.user,
        address: {
          path: ["city"],
          string_contains: location
        }
      }
    }

    if (minRating > 0) {
      whereClause.rating = { gte: minRating }
    }

    // Price range filtering (on craftsman's priceRange)
    if (minPrice > 0 || maxPrice < Infinity) {
      whereClause.priceRange = {
        path: ["min"],
        gte: minPrice
      }
      if (maxPrice < Infinity) {
        whereClause.priceRange = {
          path: ["max"],
          lte: maxPrice
        }
      }
    }

    // Build sort clause
    let orderBy: any = {}
    switch (sortBy) {
      case "rating":
        orderBy = { rating: sortOrder }
        break
      case "experience":
        orderBy = { experience: sortOrder }
        break
      case "reviews":
        orderBy = { reviewsCount: sortOrder }
        break
      case "price":
        orderBy = { priceRange: { path: ["min"], direction: sortOrder } }
        break
      default:
        orderBy = { rating: "desc" }
    }

    // Get craftsmen with filters and pagination
    const craftsmen = await db.craftsman.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            address: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await db.craftsman.count({ where: whereClause })

    // Format response
    const formattedCraftsmen = craftsmen.map(craftsman => {
      const priceRange = typeof craftsman.priceRange === 'string' 
        ? JSON.parse(craftsman.priceRange) 
        : craftsman.priceRange || { min: 0, max: 0 }
      
      const skills = typeof craftsman.skills === 'string' 
        ? JSON.parse(craftsman.skills) 
        : craftsman.skills || []

      return {
        id: craftsman.id,
        userId: craftsman.userId,
        name: craftsman.user.name,
        email: craftsman.user.email,
        phone: craftsman.user.phone,
        profileImage: craftsman.user.profileImage,
        profession: craftsman.profession,
        experience: craftsman.experience,
        description: craftsman.description,
        rating: craftsman.rating,
        reviewsCount: craftsman.reviewsCount,
        skills,
        priceRange,
        location: typeof craftsman.user.address === 'object' && craftsman.user.address && 'city' in craftsman.user.address ? (craftsman.user.address as any).city : "غير محدد",
        createdAt: craftsman.user.createdAt
      }
    })

    return NextResponse.json({
      craftsmen: formattedCraftsmen,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Search craftsmen error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في البحث عن الحرفيين" },
      { status: 500 }
    )
  }
}