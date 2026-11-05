// @cdc santé — produits proposés dans les articles de maladie. Maxi Zoo via le fichier Awin, recherche
// Amazon quand Maxi Zoo n'a pas la formule. Le texte reprend ce que dit la marque, sans promettre de soin.

export interface HealthPick {
  name: string
  why: string
  /** Formule vétérinaire : à donner sur avis du vétérinaire */
  vet: boolean
  store: 'Maxi Zoo' | 'Amazon'
  href: string
  image: string | null
}

export interface HealthNeed {
  title: string
  intro: string
  items: HealthPick[]
}

export const HEALTH_NEEDS = {
  "diabete": {
    "title": "Quels aliments pour un chien diabétique ?",
    "intro": "Ces formules existent pour le diabète. La ration et l'insuline vont ensemble : le choix se fait avec le vétérinaire.",
    "items": [
      {
        "name": "Royal Canin Veterinary Glycobalance, croquettes petit chien",
        "why": "Aliment diététique vétérinaire pour chien diabétique.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=46509664780&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F7%2F6%2F2%2F0%2F7620b4f12cfb7928e22aac7791194b61acd67eff_4245299_0.png&feedId=89880&k=b3a3e39cd116d8b2fecb7cb4205e188165871180"
      },
      {
        "name": "Royal Canin Veterinary Glycobalance, pâtée en mousse",
        "why": "La même gamme en pâtée.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=45602136665&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F3%2Fd%2F8%2F0%2F3d8095600f319ab4f42579d3d6f0c4e86fb4aff5_3241855__1_.jpg&feedId=89880&k=c04a04c4b812b72b2188a1d4f2e8862bdfd1d406"
      }
    ]
  },
  "urinaire": {
    "title": "Quels aliments pour les problèmes urinaires ?",
    "intro": "Les calculs n'ont pas tous la même nature : seul le vétérinaire peut dire si ces formules conviennent à ton chien.",
    "items": [
      {
        "name": "Royal Canin Veterinary Urinary S/O Moderate Calorie, croquettes",
        "why": "Présenté par la marque pour dissoudre les calculs de struvite et limiter les récidives.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640951048&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fa%2F7%2F8%2Ff%2Fa78f90f784fc55f5b5ad0bdd79149ff51f707508_1154455__2_.jpg&feedId=89880&k=a30bdff497e9925bb8741b598f47dd2f78f659d9"
      },
      {
        "name": "Royal Canin Veterinary Urinary Moderate Calorie, pâtée",
        "why": "La même approche en pâtée, avec plus d'eau.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=45772917667&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fb%2Fd%2Fb%2F5%2Fbdb580513462bd5b5fbc4e408c126743620f2101_1338691__2_.jpg&feedId=89880&k=f5c413f10aef64c7b5904e874cba09fd3b9a0d4b"
      },
      {
        "name": "Royal Canin Urinary Care Mini, croquettes",
        "why": "Gamme courante pour petit chien aux voies urinaires sensibles, sans remplacer une formule vétérinaire.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640932882&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F6%2F8%2F6%2Fd%2F686db2b16e3f1fae3e58887062be97039f7293fb_1311682__4_.jpg&feedId=89880&k=e356a57c7b32f994d874e57b1f25eb4409bada0e"
      }
    ]
  },
  "foie": {
    "title": "Quel aliment pour un chien qui a le foie fragile ?",
    "intro": "Cette formule se donne sur avis du vétérinaire, selon la maladie et le bilan.",
    "items": [
      {
        "name": "Hill's Prescription Diet l/d, croquettes",
        "why": "Aliment clinique de la marque pour soutenir la fonction du foie.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=41026599581&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F4%2F0%2Fb%2Fb%2F40bb712e5609706e7c619a1cf578cb09501a07a6_1891150___Position_2___PD_Canine_l___d_Dry_3D_Front.jpg&feedId=89880&k=830846a70cef67107b902ff15a82f77ddf690f03"
      }
    ]
  },
  "rein": {
    "title": "Quels aliments pour un chien en insuffisance rénale ?",
    "intro": "Maxi Zoo ne vend pas de formule rénale. Ces deux références se cherchent sur Amazon, et se donnent sur avis du vétérinaire selon le stade de la maladie.",
    "items": [
      {
        "name": "Royal Canin Veterinary Renal",
        "why": "Gamme vétérinaire de la marque pour le rein.",
        "vet": true,
        "store": "Amazon",
        "href": "https://www.amazon.fr/s?k=Royal%20Canin%20Veterinary%20Renal%20chien&tag=ambiancejap0a-21",
        "image": null
      },
      {
        "name": "Hill's Prescription Diet k/d",
        "why": "Gamme clinique de la marque pour le rein.",
        "vet": true,
        "store": "Amazon",
        "href": "https://www.amazon.fr/s?k=Hill%27s%20Prescription%20Diet%20k/d%20chien&tag=ambiancejap0a-21",
        "image": null
      }
    ]
  },
  "coeur": {
    "title": "Quels aliments pour un chien cardiaque ?",
    "intro": "Maxi Zoo ne vend pas de formule cardiaque. Ces deux références se cherchent sur Amazon, et se donnent sur avis du vétérinaire.",
    "items": [
      {
        "name": "Royal Canin Veterinary Cardiac",
        "why": "Gamme vétérinaire de la marque pour le cœur.",
        "vet": true,
        "store": "Amazon",
        "href": "https://www.amazon.fr/s?k=Royal%20Canin%20Veterinary%20Cardiac%20chien&tag=ambiancejap0a-21",
        "image": null
      },
      {
        "name": "Hill's Prescription Diet h/d",
        "why": "Gamme clinique de la marque pour le cœur.",
        "vet": true,
        "store": "Amazon",
        "href": "https://www.amazon.fr/s?k=Hill%27s%20Prescription%20Diet%20h/d%20chien&tag=ambiancejap0a-21",
        "image": null
      }
    ]
  },
  "epilepsie": {
    "title": "Quel aliment pour un chien épileptique ?",
    "intro": "Maxi Zoo ne vend pas de formule pour l'épilepsie. Celle-ci complète le traitement, sans jamais le remplacer, et se donne sur avis du vétérinaire.",
    "items": [
      {
        "name": "Purina Pro Plan Veterinary Diets NC NeuroCare",
        "why": "Présentée par la marque pour accompagner le traitement des chiens épileptiques.",
        "vet": true,
        "store": "Amazon",
        "href": "https://www.amazon.fr/s?k=Purina%20Pro%20Plan%20Veterinary%20Diets%20NeuroCare%20chien&tag=ambiancejap0a-21",
        "image": null
      }
    ]
  },
  "pancreas": {
    "title": "Quel aliment après une pancréatite ?",
    "intro": "Maxi Zoo ne vend pas de formule pauvre en graisses dédiée. Celle-ci se cherche sur Amazon et se donne sur avis du vétérinaire.",
    "items": [
      {
        "name": "Royal Canin Veterinary Gastrointestinal Low Fat",
        "why": "Gamme vétérinaire pauvre en graisses de la marque.",
        "vet": true,
        "store": "Amazon",
        "href": "https://www.amazon.fr/s?k=Royal%20Canin%20Veterinary%20Gastrointestinal%20Low%20Fat%20chien&tag=ambiancejap0a-21",
        "image": null
      }
    ]
  },
  "digestion": {
    "title": "Quels aliments pour un chien à la digestion fragile ?",
    "intro": "Si les troubles durent, consulte avant de changer d'aliment : ils ont souvent une cause à traiter.",
    "items": [
      {
        "name": "Advance Veterinary Diets Gastroenteritic, pâtée",
        "why": "Formule vétérinaire très digeste, présentée pour certains troubles gastro-intestinaux.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=37823917313&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F6%2Fb%2F0%2Fd%2F6b0d31a550e35155ebb82a468038793f11167831_1727823_0.jpg&feedId=89880&k=c889cd94cc31deef3d79b4036cf117d8601b9c45"
      },
      {
        "name": "Royal Canin Digestive Care Mini, croquettes",
        "why": "Gamme courante pour petit chien au transit sensible.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640928007&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F0%2F8%2Fd%2Fe%2F08dee262adbb93d6779fcaac51d15ac9a89adcaa_1311666__6_.jpg&feedId=89880&k=e8b88377bb19912800408e26511f94aa942d89e0"
      },
      {
        "name": "Hill's Science Plan Perfect Digestion, pâtée",
        "why": "Gamme courante enrichie en prébiotiques.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640928977&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fb%2Ff%2F8%2F0%2Fbf80e2158f573da0eb294f25ec1be629922e3cba_1362246__6_.JPG&feedId=89880&k=1d3d225cdc6b25543510b2a7a7cdc6d5af9fd402"
      },
      {
        "name": "Pro Plan Adult Small & Mini Sensitive Digestion, croquettes",
        "why": "Gamme courante pour petit chien à la digestion sensible.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640915190&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F4%2Fa%2Fc%2F3%2F4ac360f63a5a664fe5be7feb944d9952ab8f32ac_1299349_0.jpg&feedId=89880&k=a43eff058b773220def872e4bf0345e28d9bee48"
      }
    ]
  },
  "peau": {
    "title": "Quels aliments pour un chien à la peau sensible ?",
    "intro": "Pour une allergie confirmée, c'est le vétérinaire qui choisit l'aliment du test d'éviction. Vérifie aussi la viande de la recette.",
    "items": [
      {
        "name": "Advance Veterinary Diets Atopic, pâtée",
        "why": "Formule vétérinaire présentée pour la dermatite atopique et les démangeaisons.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=37823917260&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Ff%2Fb%2F1%2F4%2Ffb140ef9d72e0711b6ab86a0f1bed2d45d92f4db_1727822_0.jpg&feedId=89880&k=8eddd260bc8aaf7428fac16b2cafe0f8961f7121"
      },
      {
        "name": "Hill's Science Plan Sensitive Stomach & Skin, croquettes petit chien",
        "why": "Gamme courante pour la peau et la digestion.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640924272&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F3%2F7%2Fd%2Fe%2F37de8e0fa52f212ce7454b7928ab5f6459dc1cb5_1244781__5_.JPG&feedId=89880&k=7465d5fa8daf374e758c2138779471612b4277e4"
      },
      {
        "name": "Pro Plan Adult Small & Mini Sensitive Skin, croquettes",
        "why": "Gamme courante pour petit chien à la peau sensible.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=38068789947&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fa%2F0%2F5%2F8%2Fa058af0bc936c69298c4e8e1d984cf7cc995214c_1206421_0.png&feedId=89880&k=ea82e032a1e2c0950fdd4d6f6db40e492d5a0afa"
      }
    ]
  },
  "articulations": {
    "title": "Quels aliments pour les articulations ?",
    "intro": "Ils accompagnent le traitement de l'arthrose sans le remplacer. Le poids du chien compte autant que la croquette.",
    "items": [
      {
        "name": "Royal Canin Maxi Joint Care, croquettes",
        "why": "Gamme courante pour grand chien aux articulations sollicitées.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640922671&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fe%2Fc%2F8%2Fe%2Fec8e9faf705c9d799f34ea6c67d79d81afc302a8_1311685__5_.jpg&feedId=89880&k=e50832d65b98674c91a35922a5c464c48365dd3f"
      },
      {
        "name": "Hill's Science Plan Healthy Mobility Medium, croquettes",
        "why": "Gamme courante pour la mobilité du chien de taille moyenne.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=44279958736&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fc%2Fc%2Fb%2Fe%2Fccbe904972cd12d5f0a4779f824f6ded198b4406_1325157__8_.JPG&feedId=89880&k=95e3f39278db7441b6e85b1809517d0cb0a1e15d"
      }
    ]
  },
  "poids": {
    "title": "Quels aliments pour faire perdre du poids ?",
    "intro": "Choisis avec le vétérinaire et pèse chaque ration : la quantité compte autant que la marque.",
    "items": [
      {
        "name": "Hill's Science Plan Perfect Weight Medium, croquettes",
        "why": "Gamme courante pour atteindre et garder un poids sain.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640921120&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fd%2Ff%2F8%2F5%2Fdf85fcaa8ae10d60628acc3d89d5a2a35a23ec6c_1322239__4_.JPG&feedId=89880&k=e2ecdbe480b67b727b3f7335dfc127c3c3a052ad"
      },
      {
        "name": "Royal Canin Light Weight Care Mini, croquettes",
        "why": "Gamme courante pour petit chien qui prend du poids.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=37381857872&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fb%2Fd%2F6%2Fb%2Fbd6b16a219be419a0787d0e24d8fe1f8e7e2aca0_1081970__5_.jpg&feedId=89880&k=ea81adbae0b59ad77a3b4abb35d95e7344817532"
      },
      {
        "name": "Hill's Prescription Diet Metabolic, pâtée",
        "why": "Formule clinique pour la perte de poids, sur avis du vétérinaire.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=38885434851&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F8%2F4%2F8%2Fe%2F848e17d3744c50a5e5bfd431b64dbd314d304a34_1901534_0_fr.JPG&feedId=89880&k=da4a7217464a509c352b70910be46b8dcdf92968"
      }
    ]
  },
  "convalescence": {
    "title": "Quel aliment pour un chien affaibli ?",
    "intro": "Cette formule très énergétique se donne sur avis du vétérinaire, le temps de la reprise. Ce n'est pas un traitement.",
    "items": [
      {
        "name": "Royal Canin Veterinary Recovery, pâtée",
        "why": "Formule vétérinaire riche en énergie pour la récupération.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640929317&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F3%2Fd%2F0%2F4%2F3d04d1450fd13ae8e7a61e1a751bf0d44df9ca6c_986d03f0ed2c281c6245ff3c33f497a1561795da.jpg&feedId=89880&k=7df0316ed6b3cbc9bda8b2b62b98ba02e43a28a6"
      }
    ]
  },
  "appetit": {
    "title": "Quels aliments pour un chien qui mange peu ?",
    "intro": "Un chien qui cesse de manger doit voir le vétérinaire. Ces produits aident un chien difficile en bonne santé, et Recovery soutient la reprise.",
    "items": [
      {
        "name": "Royal Canin Exigent, pâtée en mousse",
        "why": "Gamme courante pour chien difficile.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640926693&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F0%2F6%2F5%2F9%2F065986c54deeb45983d302b4c8d6a13272923192_1317074__6_.jpg&feedId=89880&k=f925c91de8781e72e71391a5ed5e9d563bd4a619"
      },
      {
        "name": "Royal Canin Exigent Mini, croquettes",
        "why": "La même gamme pour petit chien.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640929112&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Fb%2F1%2Fb%2Fd%2Fb1bd523eaf6ea9ead127c0572051cb16b8e54b9f_1311673__fr_FR__exigentmini__2_.jpg&feedId=89880&k=69d52c5133571f237fd59a888c32d92a879dab1c"
      },
      {
        "name": "Royal Canin Veterinary Recovery, pâtée",
        "why": "Formule énergétique pour la reprise, sur avis du vétérinaire.",
        "vet": true,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640929317&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F3%2Fd%2F0%2F4%2F3d04d1450fd13ae8e7a61e1a751bf0d44df9ca6c_986d03f0ed2c281c6245ff3c33f497a1561795da.jpg&feedId=89880&k=7df0316ed6b3cbc9bda8b2b62b98ba02e43a28a6"
      }
    ]
  },
  "dents": {
    "title": "Quels produits pour limiter le tartre ?",
    "intro": "Ils complètent le brossage sans le remplacer. Une mauvaise haleine qui persiste mérite un contrôle chez le vétérinaire.",
    "items": [
      {
        "name": "Royal Canin Dental Care Medium, croquettes",
        "why": "Gamme courante conçue pour l'hygiène dentaire.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640935261&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F2%2Fd%2F4%2F2%2F2d42188dfbeab10653863b0c1bf8c2c906c08f49_1311678__3_.jpg&feedId=89880&k=5d494580dc8a75c5f60f91fdac43484f354fb957"
      },
      {
        "name": "Hill's Science Plan Oral Care, croquettes",
        "why": "Croquettes présentées pour réduire la plaque et le tartre.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=44279958934&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F0%2F3%2Fe%2F8%2F03e8c54ae51c686f1ca3dc4abc283bbeefabe70e_1322237__8_.JPG&feedId=89880&k=18e1f41595e70119a687e503cc42fcf3301bb899"
      },
      {
        "name": "Purina DentaLife Extra Mini, bâtonnets",
        "why": "Bâtonnets à mâcher pour très petit chien, à compter dans sa ration.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640921272&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F5%2F4%2F6%2F9%2F546967f4b59f870ef0960d141ad0c86c62860b5b_2bfc5f1174f03a93a7f864541ca58211f46d1e46.png&feedId=89880&k=a3d6cfffa31195de901d0ec91ed20c8ac2fd73ac"
      }
    ]
  },
  "stress": {
    "title": "Quels aliments pour un chien stressé ?",
    "intro": "Ils peuvent aider lors d'un changement passager, sans remplacer le travail sur le comportement.",
    "items": [
      {
        "name": "Royal Canin Relax Care Medium, croquettes",
        "why": "Gamme courante pour les périodes de stress.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640937715&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2F1%2F7%2F6%2Fd%2F176d218d2cb2649b92593381a551456f3f4c0cec_1312104__5_.jpg&feedId=89880&k=2024cf82d799901b598b393bfe4206d59c653494"
      },
      {
        "name": "Royal Canin Relax Care, pâtée",
        "why": "La même gamme en pâtée.",
        "vet": false,
        "store": "Maxi Zoo",
        "href": "https://www.awin1.com/pclick.php?p=36640928428&a=1112904&m=68698",
        "image": "https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=ssl%3Amedia.os.fressnapf.com%2Fproducts-v2%2Ff%2F4%2F7%2Fa%2Ff47a4d3ba60b9050c23b9b8fc73026ebd10d7fd2_1317077__5_.jpg&feedId=89880&k=3f7ceb0d3fcdc469013947edf10fcd182a6892db"
      }
    ]
  }
} as const satisfies Record<string, HealthNeed>

export type HealthNeedKey = keyof typeof HEALTH_NEEDS
