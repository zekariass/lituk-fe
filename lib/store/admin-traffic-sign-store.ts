import { create } from 'zustand'

export interface Asset {
  url: string
  type: 'image' | 'video'
  contentType: string
  size: number
  filename: string
  uploadedAt: string
}

export interface OrderedAsset extends Asset {
  caption?: string
  order: number
}

export interface Translations {
  am?: { name?: string; description?: string }
  ti?: { name?: string; description?: string }
}

export interface TrafficSignCategory {
  id: number
  jurisdictionId: number
  jurisdictionName: string
  jurisdictionCode: string
  name: string
  description: string
  translations: Translations
  asset?: Asset
  isActive: boolean
  createdAt: string
  updatedAt: string
  signCount?: number
}

export interface TrafficSign {
  id: number
  categoryId: number
  description: string
  translations: {
    am?: { description?: string }
    ti?: { description?: string }
  }
  signAsset: Asset
  additionalAssets: OrderedAsset[]
  realLifeAssets: OrderedAsset[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SignsPage {
  content: TrafficSign[]
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
}

interface AdminTrafficSignStore {
  // Jurisdiction
  selectedJurisdictionId: number | null
  setSelectedJurisdiction: (id: number) => void

  // Categories
  categories: TrafficSignCategory[]
  selectedCategory: TrafficSignCategory | null
  setCategories: (categories: TrafficSignCategory[]) => void
  setSelectedCategory: (category: TrafficSignCategory | null) => void
  addCategory: (category: TrafficSignCategory) => void
  updateCategory: (category: TrafficSignCategory) => void
  removeCategory: (id: number) => void

  // Traffic Signs
  signs: TrafficSign[]
  currentPage: number
  totalPages: number
  totalElements: number
  setSigns: (signs: TrafficSign[]) => void
  setPagination: (page: number, totalPages: number, totalElements: number) => void
  addSign: (sign: TrafficSign) => void
  updateSign: (sign: TrafficSign) => void
  removeSign: (id: number) => void

  // Sign Detail
  selectedSign: TrafficSign | null
  isDetailOpen: boolean
  setSelectedSign: (sign: TrafficSign | null) => void
  setDetailOpen: (open: boolean) => void

  // Form / Modal State
  isCreating: boolean
  isEditing: boolean
  isLoading: boolean
  setCreating: (v: boolean) => void
  setEditing: (v: boolean) => void
  setLoading: (v: boolean) => void

  // Category Modal
  isCategoryModalOpen: boolean
  editingCategory: TrafficSignCategory | null
  setCategoryModalOpen: (open: boolean) => void
  setEditingCategory: (category: TrafficSignCategory | null) => void

  // Reset
  reset: () => void
}

export const useAdminTrafficSignStore = create<AdminTrafficSignStore>((set) => ({
  selectedJurisdictionId: null,
  setSelectedJurisdiction: (id) => set({ selectedJurisdictionId: id }),

  categories: [],
  selectedCategory: null,
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (category) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === category.id ? category : c)),
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),

  signs: [],
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  setSigns: (signs) => set({ signs }),
  setPagination: (currentPage, totalPages, totalElements) =>
    set({ currentPage, totalPages, totalElements }),
  addSign: (sign) => set((state) => ({ signs: [sign, ...state.signs] })),
  updateSign: (sign) =>
    set((state) => ({
      signs: state.signs.map((s) => (s.id === sign.id ? sign : s)),
    })),
  removeSign: (id) =>
    set((state) => ({
      signs: state.signs.filter((s) => s.id !== id),
    })),

  selectedSign: null,
  isDetailOpen: false,
  setSelectedSign: (selectedSign) => set({ selectedSign }),
  setDetailOpen: (isDetailOpen) => set({ isDetailOpen }),

  isCreating: false,
  isEditing: false,
  isLoading: false,
  setCreating: (isCreating) => set({ isCreating }),
  setEditing: (isEditing) => set({ isEditing }),
  setLoading: (isLoading) => set({ isLoading }),

  isCategoryModalOpen: false,
  editingCategory: null,
  setCategoryModalOpen: (isCategoryModalOpen) => set({ isCategoryModalOpen }),
  setEditingCategory: (editingCategory) => set({ editingCategory }),

  reset: () =>
    set({
      signs: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      selectedSign: null,
      isDetailOpen: false,
      isCreating: false,
      isEditing: false,
    }),
}))
