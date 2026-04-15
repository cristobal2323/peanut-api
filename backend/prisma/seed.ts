import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

const breeds: { slug: string; nameEs: string; nameEn: string }[] = [
  { slug: 'mestizo', nameEs: 'Mestizo', nameEn: 'Mixed breed' },
  { slug: 'quiltro', nameEs: 'Quiltro', nameEn: 'Chilean mixed breed' },
  { slug: 'affenpinscher', nameEs: 'Affenpinscher', nameEn: 'Affenpinscher' },
  { slug: 'airedale-terrier', nameEs: 'Airedale Terrier', nameEn: 'Airedale Terrier' },
  { slug: 'akita', nameEs: 'Akita', nameEn: 'Akita' },
  { slug: 'alaskan-malamute', nameEs: 'Alaskan Malamute', nameEn: 'Alaskan Malamute' },
  { slug: 'american-bulldog', nameEs: 'Bulldog Americano', nameEn: 'American Bulldog' },
  { slug: 'american-pitbull-terrier', nameEs: 'Pitbull Terrier Americano', nameEn: 'American Pit Bull Terrier' },
  { slug: 'american-staffordshire-terrier', nameEs: 'Staffordshire Terrier Americano', nameEn: 'American Staffordshire Terrier' },
  { slug: 'australian-cattle-dog', nameEs: 'Pastor Ganadero Australiano', nameEn: 'Australian Cattle Dog' },
  { slug: 'australian-shepherd', nameEs: 'Pastor Australiano', nameEn: 'Australian Shepherd' },
  { slug: 'basenji', nameEs: 'Basenji', nameEn: 'Basenji' },
  { slug: 'basset-hound', nameEs: 'Basset Hound', nameEn: 'Basset Hound' },
  { slug: 'beagle', nameEs: 'Beagle', nameEn: 'Beagle' },
  { slug: 'bearded-collie', nameEs: 'Collie Barbudo', nameEn: 'Bearded Collie' },
  { slug: 'bernese-mountain-dog', nameEs: 'Boyero de Berna', nameEn: 'Bernese Mountain Dog' },
  { slug: 'bichon-frise', nameEs: 'Bichón Frisé', nameEn: 'Bichon Frise' },
  { slug: 'bloodhound', nameEs: 'Sabueso', nameEn: 'Bloodhound' },
  { slug: 'border-collie', nameEs: 'Border Collie', nameEn: 'Border Collie' },
  { slug: 'border-terrier', nameEs: 'Border Terrier', nameEn: 'Border Terrier' },
  { slug: 'borzoi', nameEs: 'Borzoi', nameEn: 'Borzoi' },
  { slug: 'boston-terrier', nameEs: 'Boston Terrier', nameEn: 'Boston Terrier' },
  { slug: 'boxer', nameEs: 'Bóxer', nameEn: 'Boxer' },
  { slug: 'brittany', nameEs: 'Bretón', nameEn: 'Brittany' },
  { slug: 'bulldog', nameEs: 'Bulldog Inglés', nameEn: 'English Bulldog' },
  { slug: 'bull-terrier', nameEs: 'Bull Terrier', nameEn: 'Bull Terrier' },
  { slug: 'cairn-terrier', nameEs: 'Cairn Terrier', nameEn: 'Cairn Terrier' },
  { slug: 'cane-corso', nameEs: 'Cane Corso', nameEn: 'Cane Corso' },
  { slug: 'cavalier-king-charles-spaniel', nameEs: 'Cavalier King Charles Spaniel', nameEn: 'Cavalier King Charles Spaniel' },
  { slug: 'chesapeake-bay-retriever', nameEs: 'Chesapeake Bay Retriever', nameEn: 'Chesapeake Bay Retriever' },
  { slug: 'chihuahua', nameEs: 'Chihuahua', nameEn: 'Chihuahua' },
  { slug: 'chinese-crested', nameEs: 'Crestado Chino', nameEn: 'Chinese Crested' },
  { slug: 'chow-chow', nameEs: 'Chow Chow', nameEn: 'Chow Chow' },
  { slug: 'cocker-spaniel', nameEs: 'Cocker Spaniel', nameEn: 'Cocker Spaniel' },
  { slug: 'collie', nameEs: 'Collie', nameEn: 'Collie' },
  { slug: 'coton-de-tulear', nameEs: 'Coton de Tuléar', nameEn: 'Coton de Tulear' },
  { slug: 'dachshund', nameEs: 'Dachshund (Salchicha)', nameEn: 'Dachshund' },
  { slug: 'dalmatian', nameEs: 'Dálmata', nameEn: 'Dalmatian' },
  { slug: 'doberman-pinscher', nameEs: 'Dóberman', nameEn: 'Doberman Pinscher' },
  { slug: 'dogo-argentino', nameEs: 'Dogo Argentino', nameEn: 'Dogo Argentino' },
  { slug: 'dogue-de-bordeaux', nameEs: 'Dogo de Burdeos', nameEn: 'Dogue de Bordeaux' },
  { slug: 'english-mastiff', nameEs: 'Mastín Inglés', nameEn: 'English Mastiff' },
  { slug: 'english-setter', nameEs: 'Setter Inglés', nameEn: 'English Setter' },
  { slug: 'english-springer-spaniel', nameEs: 'Springer Spaniel Inglés', nameEn: 'English Springer Spaniel' },
  { slug: 'fox-terrier', nameEs: 'Fox Terrier', nameEn: 'Fox Terrier' },
  { slug: 'french-bulldog', nameEs: 'Bulldog Francés', nameEn: 'French Bulldog' },
  { slug: 'german-pinscher', nameEs: 'Pinscher Alemán', nameEn: 'German Pinscher' },
  { slug: 'german-shepherd', nameEs: 'Pastor Alemán', nameEn: 'German Shepherd' },
  { slug: 'german-shorthaired-pointer', nameEs: 'Braco Alemán', nameEn: 'German Shorthaired Pointer' },
  { slug: 'golden-retriever', nameEs: 'Golden Retriever', nameEn: 'Golden Retriever' },
  { slug: 'gordon-setter', nameEs: 'Setter Gordon', nameEn: 'Gordon Setter' },
  { slug: 'great-dane', nameEs: 'Gran Danés', nameEn: 'Great Dane' },
  { slug: 'great-pyrenees', nameEs: 'Gran Pirineo', nameEn: 'Great Pyrenees' },
  { slug: 'greyhound', nameEs: 'Galgo Inglés', nameEn: 'Greyhound' },
  { slug: 'havanese', nameEs: 'Bichón Habanero', nameEn: 'Havanese' },
  { slug: 'irish-setter', nameEs: 'Setter Irlandés', nameEn: 'Irish Setter' },
  { slug: 'irish-wolfhound', nameEs: 'Lobero Irlandés', nameEn: 'Irish Wolfhound' },
  { slug: 'italian-greyhound', nameEs: 'Galgo Italiano', nameEn: 'Italian Greyhound' },
  { slug: 'jack-russell-terrier', nameEs: 'Jack Russell Terrier', nameEn: 'Jack Russell Terrier' },
  { slug: 'japanese-spitz', nameEs: 'Spitz Japonés', nameEn: 'Japanese Spitz' },
  { slug: 'keeshond', nameEs: 'Keeshond', nameEn: 'Keeshond' },
  { slug: 'labrador-retriever', nameEs: 'Labrador Retriever', nameEn: 'Labrador Retriever' },
  { slug: 'lhasa-apso', nameEs: 'Lhasa Apso', nameEn: 'Lhasa Apso' },
  { slug: 'maltese', nameEs: 'Maltés', nameEn: 'Maltese' },
  { slug: 'mastiff', nameEs: 'Mastín', nameEn: 'Mastiff' },
  { slug: 'miniature-pinscher', nameEs: 'Pinscher Miniatura', nameEn: 'Miniature Pinscher' },
  { slug: 'miniature-schnauzer', nameEs: 'Schnauzer Miniatura', nameEn: 'Miniature Schnauzer' },
  { slug: 'neapolitan-mastiff', nameEs: 'Mastín Napolitano', nameEn: 'Neapolitan Mastiff' },
  { slug: 'newfoundland', nameEs: 'Terranova', nameEn: 'Newfoundland' },
  { slug: 'norfolk-terrier', nameEs: 'Norfolk Terrier', nameEn: 'Norfolk Terrier' },
  { slug: 'norwegian-elkhound', nameEs: 'Elkhound Noruego', nameEn: 'Norwegian Elkhound' },
  { slug: 'old-english-sheepdog', nameEs: 'Bobtail', nameEn: 'Old English Sheepdog' },
  { slug: 'papillon', nameEs: 'Papillón', nameEn: 'Papillon' },
  { slug: 'pekingese', nameEs: 'Pequinés', nameEn: 'Pekingese' },
  { slug: 'pembroke-welsh-corgi', nameEs: 'Corgi Galés de Pembroke', nameEn: 'Pembroke Welsh Corgi' },
  { slug: 'pointer', nameEs: 'Pointer', nameEn: 'Pointer' },
  { slug: 'pomeranian', nameEs: 'Pomerania', nameEn: 'Pomeranian' },
  { slug: 'poodle-standard', nameEs: 'Poodle Estándar', nameEn: 'Standard Poodle' },
  { slug: 'poodle-miniature', nameEs: 'Poodle Miniatura', nameEn: 'Miniature Poodle' },
  { slug: 'poodle-toy', nameEs: 'Poodle Toy', nameEn: 'Toy Poodle' },
  { slug: 'portuguese-water-dog', nameEs: 'Perro de Agua Portugués', nameEn: 'Portuguese Water Dog' },
  { slug: 'pug', nameEs: 'Pug', nameEn: 'Pug' },
  { slug: 'puli', nameEs: 'Puli', nameEn: 'Puli' },
  { slug: 'rhodesian-ridgeback', nameEs: 'Ridgeback de Rodesia', nameEn: 'Rhodesian Ridgeback' },
  { slug: 'rottweiler', nameEs: 'Rottweiler', nameEn: 'Rottweiler' },
  { slug: 'saint-bernard', nameEs: 'San Bernardo', nameEn: 'Saint Bernard' },
  { slug: 'saluki', nameEs: 'Saluki', nameEn: 'Saluki' },
  { slug: 'samoyed', nameEs: 'Samoyedo', nameEn: 'Samoyed' },
  { slug: 'schipperke', nameEs: 'Schipperke', nameEn: 'Schipperke' },
  { slug: 'schnauzer', nameEs: 'Schnauzer', nameEn: 'Schnauzer' },
  { slug: 'scottish-terrier', nameEs: 'Terrier Escocés', nameEn: 'Scottish Terrier' },
  { slug: 'shar-pei', nameEs: 'Shar Pei', nameEn: 'Shar Pei' },
  { slug: 'shetland-sheepdog', nameEs: 'Pastor de Shetland', nameEn: 'Shetland Sheepdog' },
  { slug: 'shiba-inu', nameEs: 'Shiba Inu', nameEn: 'Shiba Inu' },
  { slug: 'shih-tzu', nameEs: 'Shih Tzu', nameEn: 'Shih Tzu' },
  { slug: 'siberian-husky', nameEs: 'Husky Siberiano', nameEn: 'Siberian Husky' },
  { slug: 'silky-terrier', nameEs: 'Silky Terrier', nameEn: 'Silky Terrier' },
  { slug: 'skye-terrier', nameEs: 'Skye Terrier', nameEn: 'Skye Terrier' },
  { slug: 'staffordshire-bull-terrier', nameEs: 'Staffordshire Bull Terrier', nameEn: 'Staffordshire Bull Terrier' },
  { slug: 'tibetan-mastiff', nameEs: 'Mastín Tibetano', nameEn: 'Tibetan Mastiff' },
  { slug: 'vizsla', nameEs: 'Vizsla', nameEn: 'Vizsla' },
  { slug: 'weimaraner', nameEs: 'Weimaraner', nameEn: 'Weimaraner' },
  { slug: 'welsh-terrier', nameEs: 'Welsh Terrier', nameEn: 'Welsh Terrier' },
  { slug: 'west-highland-white-terrier', nameEs: 'Westie', nameEn: 'West Highland White Terrier' },
  { slug: 'whippet', nameEs: 'Whippet', nameEn: 'Whippet' },
  { slug: 'yorkshire-terrier', nameEs: 'Yorkshire Terrier', nameEn: 'Yorkshire Terrier' },
];

const colors: { slug: string; nameEs: string; nameEn: string; hex?: string }[] = [
  { slug: 'black', nameEs: 'Negro', nameEn: 'Black', hex: '#111111' },
  { slug: 'white', nameEs: 'Blanco', nameEn: 'White', hex: '#F8F8F8' },
  { slug: 'brown', nameEs: 'Marrón', nameEn: 'Brown', hex: '#6B3F1D' },
  { slug: 'chocolate', nameEs: 'Chocolate', nameEn: 'Chocolate', hex: '#3E2A14' },
  { slug: 'cream', nameEs: 'Crema', nameEn: 'Cream', hex: '#F0E6CE' },
  { slug: 'golden', nameEs: 'Dorado', nameEn: 'Golden', hex: '#E4B968' },
  { slug: 'tan', nameEs: 'Canela', nameEn: 'Tan', hex: '#C68A5B' },
  { slug: 'gray', nameEs: 'Gris', nameEn: 'Gray', hex: '#8A8A8A' },
  { slug: 'red', nameEs: 'Rojizo', nameEn: 'Red', hex: '#A2482A' },
  { slug: 'brindle', nameEs: 'Atigrado', nameEn: 'Brindle' },
  { slug: 'merle', nameEs: 'Merle', nameEn: 'Merle' },
  { slug: 'tricolor', nameEs: 'Tricolor', nameEn: 'Tricolor' },
  { slug: 'black-white', nameEs: 'Negro / Blanco', nameEn: 'Black / White' },
  { slug: 'brown-white', nameEs: 'Marrón / Blanco', nameEn: 'Brown / White' },
  { slug: 'spotted', nameEs: 'Manchado', nameEn: 'Spotted' },
];

async function main() {
  console.log('Seeding breeds...');
  for (const b of breeds) {
    await prisma.breed.upsert({
      where: { slug: b.slug },
      update: { nameEs: b.nameEs, nameEn: b.nameEn },
      create: b,
    });
  }
  console.log(`Seeded ${breeds.length} breeds.`);

  console.log('Seeding colors...');
  for (const c of colors) {
    await prisma.color.upsert({
      where: { slug: c.slug },
      update: { nameEs: c.nameEs, nameEn: c.nameEn, hex: c.hex ?? null },
      create: c,
    });
  }
  console.log(`Seeded ${colors.length} colors.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
