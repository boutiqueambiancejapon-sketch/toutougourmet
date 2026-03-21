export interface AuthorPet {
  name: string
  breed: string
  age: number
  note: string
}

export interface Author {
  slug: string
  name: string
  title: string
  bio: string
  bioLong: string
  pets: AuthorPet[]
  url: string
  linkedin?: string
  knowsAbout: string[]
}

export const AUTHORS: Record<string, Author> = {
  'mathias-c': {
    slug: 'mathias-c',
    name: 'Mathias C.',
    title: 'Fondateur & rédacteur',
    bio: "Propriétaire de Charlie, Oxy et Milo. Écrit sur l'alimentation canine depuis les tranchées — insuffisance rénale, calculs, repas frais.",
    bioLong:
      "Mathias a fondé Toutou Gourmet après avoir navigué pendant des années dans le labyrinthe de l'alimentation vétérinaire avec ses trois chiens. Charlie, son cavalier king charles de 12 ans, vit avec une insuffisance rénale chronique et un souffle au cœur — ce qui a transformé chaque repas en équation calcium/phosphore/protéines. Oxy, 2 ans, a développé des calculs rénaux très tôt, forçant un choix alimentaire ultra-précis. Milo, shiba inu de 9 ans, mange des repas frais Dog Chef depuis deux ans et n'a jamais été en meilleure forme. Ces expériences terrain, croisées avec des heures de lecture de littérature vétérinaire, sont la matière première de chaque article publié ici.",
    pets: [
      {
        name: 'Charlie',
        breed: 'Cavalier King Charles',
        age: 12,
        note: 'Insuffisance rénale chronique + souffle au cœur',
      },
      {
        name: 'Oxy',
        breed: 'Cavalier King Charles',
        age: 2,
        note: 'Calculs rénaux',
      },
      {
        name: 'Milo',
        breed: 'Shiba Inu',
        age: 9,
        note: 'Repas frais Dog Chef',
      },
    ],
    url: '/auteurs/mathias-c',
    linkedin: 'https://www.linkedin.com/in/mathiascetani/',
    knowsAbout: [
      'alimentation chien',
      'nutrition canine',
      'insuffisance rénale chien',
      'calculs urinaires chien',
      'repas frais chien',
      'cavalier king charles',
      'shiba inu',
    ],
  },
}

export function getAuthorBySlug(slug: string): Author | null {
  return AUTHORS[slug] ?? null
}

// Auteur par défaut pour tous les articles
export const DEFAULT_AUTHOR = AUTHORS['mathias-c']
