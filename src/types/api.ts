export type ApiId = string;

export type ApiRole = "USER" | "ADMIN" | string;

export type ApiPage<TItem> = {
  items: TItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiPaginatedResponse<TItem> = {
  data: TItem[];
  pagination: ApiPagination;
};

export type ApiMessageResponse = {
  message: string;
};

export type PrismaTimestamps = Partial<{
  createdAt: string;
  updatedAt: string;
}>;

export type PaginationQuery = {
  page: number;
  limit: number;
};

export type AuthHeader = {
  Authorization: `Bearer ${string}`;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type ApiUser = {
  id: ApiId;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: ApiRole;
  likedAnimals?: unknown[];
  applications?: unknown[];
  adoptionApplications?: unknown[];
};

export type UserResponse = ApiUser &
  PrismaTimestamps &
  Partial<{
    likedAnimals: LikedAnimalResponse[];
    adoptedAnimals: AnimalResponse[];
  }>;

export type AuthResponse = {
  message: string;
  token: string;
  user: ApiUser;
};

export type AuthMeResponse = UserResponse;
export type ForgotPasswordResponse = ApiMessageResponse;
export type ResetPasswordResponse = ApiMessageResponse;
export type DeleteAvatarResponse = ApiMessageResponse & {
  user: Partial<UserResponse>;
};

export type UpdateProfileRequest = Partial<{
  name: string;
  email: string;
  phone: string | null;
}>;

export type AvatarUploadRequest = {
  image: File;
};

export type AnimalType = "CAT" | "DOG";

export type AnimalGender = "MALE" | "FEMALE";

export type AnimalStatus = "AVAILABLE" | "PENDING" | "ADOPTED";

export type EntityImage = {
  id: ApiId;
  imageUrl: string;
  publicId: string;
};

export type Animal = {
  id: ApiId;
  name: string;
  category: string;
  categoryCode: AnimalType | string;
  age: string;
  gender: string;
  genderCode: AnimalGender | string;
  breed: string | null;
  city: string;
  description: string;
  imageUrl: string | null;
  images: EntityImage[];
  healthStatus: string;
  shelterId: ApiId | null;
  shelterName: string;
  rating: number;
};

export type AnimalsQuery = PaginationQuery &
  Partial<{
    type: AnimalType | string;
    category: AnimalType | string;
    gender: AnimalGender | string;
    city: string;
    status: AnimalStatus | string;
    search: string;
  }>;

export type CreateAnimalRequest = {
  name: string;
  type: AnimalType | string;
  gender: AnimalGender | string;
  age: number;
  breed?: string;
  healthStatus: string;
  description: string;
  shelterId: ApiId;
};

export type UpdateAnimalRequest = Partial<{
  name: string;
  type: AnimalType | string;
  gender: AnimalGender | string;
  age: number;
  breed: string;
  healthStatus: string;
  description: string;
  status: AnimalStatus | string;
}>;

export type AnimalImageUploadRequest = {
  image: File;
};

export type AnimalShelterResponse = Partial<{
  id: ApiId;
  _id: ApiId;
  name: string;
  title: string;
  city: string;
  location: string;
}>;

export type AnimalResponse = PrismaTimestamps &
  Partial<{
    id: ApiId;
    _id: ApiId;
    name: string;
    type: AnimalType | string;
    gender: AnimalGender | string;
    city: string;
    age: number | string;
    breed: string | null;
    healthStatus: string;
    description: string;
    status: AnimalStatus | string;
    shelterId: ApiId;
    imageUrl: string | null;
    image: string | null;
    photoUrl: string | null;
    images: EntityImage[];
    shelter: AnimalShelterResponse | null;
  }>;

export type AnimalsResponse = ApiPaginatedResponse<AnimalResponse>;
export type AnimalDetailsResponse = AnimalResponse;
export type DeleteAnimalResponse = ApiMessageResponse;
export type UploadAnimalImageResponse = EntityImage;
export type DeleteAnimalImageResponse = ApiMessageResponse;

export type LikedAnimalResponse = AnimalResponse &
  Partial<{
    likedAt: string;
  }>;
export type LikedAnimalsResponse = LikedAnimalResponse[];
export type AddLikedAnimalResponse = LikedAnimalResponse;
export type DeleteLikedAnimalResponse = ApiMessageResponse;
export type AdoptedAnimalsResponse = AnimalResponse[];

export type ApiPaginationMeta = Partial<
  ApiPagination & {
    currentPage: number;
    totalItems: number;
    totalCount: number;
    count: number;
    pages: number;
    lastPage: number;
  }
>;

export type AnimalApiItem = AnimalResponse;
export type AnimalsApiResponse = Partial<
  AnimalsResponse & {
    items: AnimalApiItem[];
    data: AnimalApiItem[] | AnimalApiItem;
    item: AnimalApiItem;
    animal: AnimalApiItem;
    animals: AnimalApiItem[];
    pet: AnimalApiItem;
    pets: AnimalApiItem[];
    page: number;
    currentPage: number;
    limit: number;
    total: number;
    totalItems: number;
    totalCount: number;
    count: number;
    totalPages: number;
    pages: number;
    lastPage: number;
    meta: ApiPaginationMeta;
    pagination: ApiPaginationMeta;
  }
>;
export type LikedAnimalApiItem = Partial<{
  userId: string;
  animalId: string;
  animal: AnimalApiItem | null;
  createdAt: string;
}> &
  LikedAnimalResponse;
export type LikedAnimalsApiResponse =
  | LikedAnimalsResponse
  | Partial<{
      items: LikedAnimalApiItem[];
      data: LikedAnimalApiItem[];
      likedAnimals: LikedAnimalApiItem[];
      animals: AnimalApiItem[];
      user: {
        likedAnimals?: unknown[];
      };
    }>;

export type Shelter = {
  id: ApiId;
  name: string;
  city: string;
  address: string;
  description: string;
  imageUrl: string | null;
  images: EntityImage[];
  animalsCount: number;
  rating: number;
  phone: string;
  email: string;
  workingHours: string;
  foundedAt: string;
};

export type SheltersQuery = PaginationQuery &
  Partial<{
    search: string;
    address: string;
    city: string;
  }>;

export type CreateShelterRequest = {
  name: string;
  description?: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  foundationDate?: string;
  foundedAt?: string;
  workingHours?: string;
};

export type UpdateShelterRequest = Partial<{
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  foundationDate: string;
  workingHours: string;
  imageUrl: string | null;
  animalsCount: number;
  foundedAt: string;
}>;

export type ShelterImageUploadRequest = {
  image: File;
};

export type ShelterResponse = PrismaTimestamps &
  Partial<{
    id: ApiId;
    _id: ApiId;
    name: string;
    title: string;
    description: string;
    about: string;
    city: string;
    location: string;
    address: string;
    phone: string;
    phoneNumber: string;
    contactPhone: string;
    email: string;
    contactEmail: string;
    foundationDate: string;
    foundedAt: string;
    foundedYear: string | number;
    workingHours: string;
    workHours: string;
    hours: string;
    schedule: string;
    imageUrl: string | null;
    image: string | null;
    photoUrl: string | null;
    coverUrl: string | null;
    images: EntityImage[];
    animals: unknown[];
    pets: unknown[];
    animalsCount: number;
    animalCount: number;
    petsCount: number;
    petCount: number;
    rating: number;
    stars: number;
  }>;

export type SheltersResponse = ApiPaginatedResponse<ShelterResponse>;
export type ShelterDetailsResponse = ShelterResponse;
export type ShelterAnimalsResponse = AnimalResponse[];
export type DeleteShelterResponse = ApiMessageResponse;
export type RemoveShelterAnimalResponse = ApiMessageResponse & {
  animal: AnimalResponse;
};
export type UploadShelterImageResponse = EntityImage;
export type DeleteShelterImageResponse = ApiMessageResponse;

export type ShelterApiItem = ShelterResponse;
export type SheltersApiResponse = Partial<
  SheltersResponse & {
    items: ShelterApiItem[];
    data: ShelterApiItem[];
    shelters: ShelterApiItem[];
    page: number;
    currentPage: number;
    limit: number;
    total: number;
    totalItems: number;
    totalCount: number;
    count: number;
    totalPages: number;
    pages: number;
    lastPage: number;
    meta: ApiPaginationMeta;
    pagination: ApiPaginationMeta;
  }
>;

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ApplicationUser = {
  id: ApiId;
  name: string;
  avatarUrl: string | null;
};

export type AdoptionApplication = {
  id: ApiId;
  message: string | null;
  status: ApplicationStatus | string;
  userId: ApiId | null;
  user: ApplicationUser | null;
  animalId: ApiId;
  animal: Animal | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ApplicationResponse = PrismaTimestamps & {
  id: ApiId;
  message: string | null;
  status: ApplicationStatus | string;
  userId: ApiId;
  animalId: ApiId;
  user?: Partial<UserResponse>;
  animal?: AnimalResponse;
};

export type ApplicationsResponse = ApplicationResponse[];
export type MyApplicationsResponse = Omit<ApplicationResponse, "user">[];
export type UpdateApplicationStatusResponse = ApplicationResponse;

export type AdoptionApplicationApiItem = Partial<
  Omit<ApplicationResponse, "animal" | "user"> & {
    _id: string | number;
    pet: unknown;
    user: unknown;
    animal: unknown;
  }
>;
export type AdoptionApplicationApiUser = Partial<
  UserResponse & {
    _id: string | number;
    fullName: string;
    avatar: string | null;
    imageUrl: string | null;
    photoUrl: string | null;
  }
>;
export type ApplicationsApiResponse =
  | ApplicationsResponse
  | Partial<{
      items: AdoptionApplicationApiItem[];
      data: AdoptionApplicationApiItem[];
      applications: AdoptionApplicationApiItem[];
      adoptionApplications: AdoptionApplicationApiItem[];
      user: {
        applications?: unknown[];
        adoptionApplications?: unknown[];
      };
      message: string | string[];
    }>;

export type CreateApplicationRequest = {
  animalId: ApiId;
  message?: string;
};

export type ApplicationsQuery = Partial<{
  status: ApplicationStatus | string;
}>;

export type UpdateApplicationStatusRequest = {
  status: ApplicationStatus;
};

export type Article = {
  id: ApiId;
  title: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
};

export type ArticleResponse = PrismaTimestamps & {
  id: ApiId;
  title: string;
  content: string;
  imageUrl: string | null;
  imagePublicId?: string | null;
  createdAt: string;
};

export type ArticlesResponse = ApiPaginatedResponse<ArticleResponse>;
export type ArticleDetailsResponse = ArticleResponse;
export type DeleteArticleResponse = ApiMessageResponse;

export type ArticleApiItem = Partial<
  ArticleResponse & {
    _id: string | number;
    name: string;
    text: string;
    description: string;
    image: string | null;
    photoUrl: string | null;
    date: string;
    updatedAt: string;
  }
>;
export type ArticlesApiResponse = Partial<
  ArticlesResponse & {
    items: ArticleApiItem[];
    data: ArticleApiItem[] | ArticleApiItem;
    item: ArticleApiItem;
    article: ArticleApiItem;
    articles: ArticleApiItem[];
    page: number;
    currentPage: number;
    limit: number;
    total: number;
    totalItems: number;
    totalCount: number;
    count: number;
    totalPages: number;
    pages: number;
    lastPage: number;
    meta: ApiPaginationMeta;
    pagination: ApiPaginationMeta;
  }
>;

export type ArticlesQuery = PaginationQuery &
  Partial<{
    search: string;
  }>;

export type CreateArticleRequest = {
  title: string;
  content: string;
  imageUrl?: string | null;
  image?: File | string | null;
};

export type UpdateArticleRequest = Partial<CreateArticleRequest>;
