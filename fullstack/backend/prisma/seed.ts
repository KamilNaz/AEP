import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aep.pl' },
    update: {},
    create: {
      email: 'admin@aep.pl',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
      unit: 'KG ŻW',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@aep.pl' },
    update: {},
    create: {
      email: 'user@aep.pl',
      password: userPassword,
      name: 'Jan Kowalski',
      role: 'USER',
      unit: 'OŻW Elbląg',
    },
  });
  console.log('Created test user:', user.email);

  // Create sample patrols
  const patrols = [
    {
      data: new Date('2026-01-15'),
      nazwaJw: 'JW 1234',
      nrJw: '1234',
      miejsce: 'Warszawa',
      podleglosc: 'WL',
      rodzajPatrolu: 'Prewencyjny',
      trasa: 'Centrum - Mokotów',
      skladPatrolu: 'plut. Nowak, szer. Kowalski',
      czasRozpoczecia: '08:00',
      czasZakonczenia: '16:00',
      status: 'Zakończony',
      createdBy: user.id,
    },
    {
      data: new Date('2026-01-20'),
      nazwaJw: 'JW 5678',
      nrJw: '5678',
      miejsce: 'Kraków',
      podleglosc: 'MON',
      rodzajPatrolu: 'Interwencyjny',
      trasa: 'Stare Miasto',
      skladPatrolu: 'st. szer. Wiśniewski, szer. Dąbrowski',
      czasRozpoczecia: '10:00',
      czasZakonczenia: '18:00',
      status: 'W trakcie',
      createdBy: user.id,
    },
    {
      data: new Date('2026-01-25'),
      nazwaJw: 'JW 9012',
      nrJw: '9012',
      miejsce: 'Gdańsk',
      podleglosc: 'WL',
      rodzajPatrolu: 'Patrolowy',
      trasa: 'Port - Śródmieście',
      skladPatrolu: 'kpr. Mazur, szer. Zieliński',
      czasRozpoczecia: '06:00',
      czasZakonczenia: '14:00',
      status: 'Aktywny',
      createdBy: admin.id,
    },
  ];

  for (const patrol of patrols) {
    await prisma.patrol.create({ data: patrol });
  }
  console.log('Created sample patrols');

  // Create sample wykroczenia
  const wykroczenia = [
    {
      data: new Date('2026-01-10'),
      jednostka: 'OŻW Elbląg',
      rodzaj: 'Wykroczenie drogowe',
      artykul: 'Art. 92a KW',
      miejsce: 'ul. Wojska Polskiego 15, Elbląg',
      sprawca: 'Jan Testowy',
      pesel: '90010112345',
      srodekPrawny: 'Mandat',
      mandat: 500,
      punkty: 6,
      status: 'Zakończony',
      createdBy: user.id,
    },
    {
      data: new Date('2026-01-18'),
      jednostka: 'OŻW Kraków',
      rodzaj: 'Wykroczenie porządkowe',
      artykul: 'Art. 51 KW',
      miejsce: 'JW 2345, Kraków',
      sprawca: 'Adam Przykładowy',
      pesel: '85050512345',
      srodekPrawny: 'Pouczenie',
      status: 'Zakończony',
      createdBy: user.id,
    },
  ];

  for (const wykroczenie of wykroczenia) {
    await prisma.wykroczenie.create({ data: wykroczenie });
  }
  console.log('Created sample wykroczenia');

  // Create sample zdarzenia
  const zdarzenia = [
    {
      data: new Date('2026-01-12'),
      rodzajZdarzenia: 'Kolizja',
      miejsce: 'Skrzyżowanie ul. Głównej z ul. Boczną',
      okolicznosci: 'Zderzenie dwóch pojazdów służbowych',
      poszkodowani: 0,
      ranni: 0,
      zabici: 0,
      kolizja: true,
      status: 'Zakończony',
      createdBy: user.id,
    },
  ];

  for (const zdarzenie of zdarzenia) {
    await prisma.zdarzenie.create({ data: zdarzenie });
  }
  console.log('Created sample zdarzenia');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
