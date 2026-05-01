import { db, propertiesTable, tenantsTable, paymentsTable, contractsTable, maintenanceTable, notificationsTable, activitiesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding Movia Immo database with Moroccan demo data...");

  // Clear existing data
  await db.delete(activitiesTable);
  await db.delete(notificationsTable);
  await db.delete(maintenanceTable);
  await db.delete(contractsTable);
  await db.delete(paymentsTable);
  await db.delete(tenantsTable);
  await db.delete(propertiesTable);

  // Properties
  const properties = await db.insert(propertiesTable).values([
    {
      reference: "BIEN-0001",
      title: "Appartement Vue Mer Malabata",
      type: "appartement",
      zone: "Malabata",
      address: "Résidence Les Orangers, Bd Malabata, Tanger",
      floor: 4,
      surface: "95",
      rooms: 3,
      bathrooms: 2,
      rentAmount: "8500",
      chargesAmount: "500",
      depositAmount: "17000",
      status: "occupe",
      amenities: ["Climatisation", "Parking", "Ascenseur", "Terrasse", "Vue mer"],
      latitude: "35.7875",
      longitude: "-5.8123",
      description: "Magnifique appartement avec vue panoramique sur la mer Méditerranée. Résidence sécurisée avec gardiennage 24h/24.",
    },
    {
      reference: "BIEN-0002",
      title: "Villa Cap Spartel",
      type: "villa",
      zone: "Cap_Spartel",
      address: "Route du Cap Spartel, Km 12, Tanger",
      floor: 0,
      surface: "280",
      rooms: 5,
      bathrooms: 3,
      rentAmount: "18000",
      chargesAmount: "1200",
      depositAmount: "36000",
      status: "occupe",
      amenities: ["Piscine", "Jardin", "Parking", "Barbecue", "Vue mer", "Climatisation"],
      latitude: "35.7891",
      longitude: "-5.9254",
      description: "Splendide villa avec piscine au Cap Spartel, entre mer et forêt. Idéale pour une famille ou expatriés.",
    },
    {
      reference: "BIEN-0003",
      title: "Studio Médina Rénovée",
      type: "studio",
      zone: "Medina",
      address: "Derb Sidi Bouabid, Médina, Tanger",
      floor: 1,
      surface: "42",
      rooms: 1,
      bathrooms: 1,
      rentAmount: "3500",
      chargesAmount: "200",
      depositAmount: "7000",
      status: "occupe",
      amenities: ["Wifi", "Cuisine équipée", "Chauffe-eau solaire"],
      latitude: "35.7886",
      longitude: "-5.8107",
      description: "Studio entièrement rénové au coeur de la médina historique de Tanger.",
    },
    {
      reference: "BIEN-0004",
      title: "Bureau Centre Ville",
      type: "bureau",
      zone: "Centre_Ville",
      address: "Bd Mohammed V, 3ème étage, Tanger",
      floor: 3,
      surface: "120",
      rooms: 4,
      bathrooms: 2,
      rentAmount: "12000",
      chargesAmount: "800",
      depositAmount: "24000",
      status: "occupe",
      amenities: ["Climatisation", "Fibre optique", "Parking souterrain", "Salle de réunion"],
      latitude: "35.7694",
      longitude: "-5.8034",
      description: "Bureaux modernes en plein centre commercial de Tanger, idéals pour une société.",
    },
    {
      reference: "BIEN-0005",
      title: "Appartement Asilah Bord de Mer",
      type: "appartement",
      zone: "Asilah",
      address: "Résidence Oued El Makhazine, Asilah",
      floor: 2,
      surface: "75",
      rooms: 2,
      bathrooms: 1,
      rentAmount: "5500",
      chargesAmount: "350",
      depositAmount: "11000",
      status: "disponible",
      amenities: ["Vue mer", "Terrasse", "Parking"],
      latitude: "35.4652",
      longitude: "-6.0342",
      description: "Appartement lumineux à Asilah, ville authentique aux remparts blancs.",
    },
    {
      reference: "BIEN-0006",
      title: "Riad Médina Tanger",
      type: "riad",
      zone: "Medina",
      address: "Rue Ben Raissoul, Médina, Tanger",
      floor: 0,
      surface: "180",
      rooms: 4,
      bathrooms: 3,
      rentAmount: "15000",
      chargesAmount: "600",
      depositAmount: "30000",
      status: "maintenance",
      amenities: ["Patio", "Terrasse toit", "Fontaine", "Hammam"],
      latitude: "35.7901",
      longitude: "-5.8098",
      description: "Riad traditionnel rénové avec caractère authentique marocain. En rénovation partielle.",
    },
    {
      reference: "BIEN-0007",
      title: "Villa Tétouan Résidentielle",
      type: "villa",
      zone: "Tetouan",
      address: "Quartier Sania, Tétouan",
      floor: 0,
      surface: "220",
      rooms: 4,
      bathrooms: 3,
      rentAmount: "14000",
      chargesAmount: "900",
      depositAmount: "28000",
      status: "occupe",
      amenities: ["Jardin", "Parking", "Climatisation", "Terrasse"],
      latitude: "35.5785",
      longitude: "-5.3636",
      description: "Belle villa dans quartier résidentiel calme de Tétouan.",
    },
    {
      reference: "BIEN-0008",
      title: "Local Commercial Iberia",
      type: "local_commercial",
      zone: "Iberia",
      address: "Av. Iberia, Zone Commerciale, Tanger",
      floor: 0,
      surface: "85",
      rooms: 2,
      bathrooms: 1,
      rentAmount: "9000",
      chargesAmount: "600",
      depositAmount: "18000",
      status: "occupe",
      amenities: ["Vitrine", "Parking client", "Réserve", "Climatisation"],
      latitude: "35.7545",
      longitude: "-5.8219",
      description: "Local commercial en angle avec grande vitrine sur avenue passante.",
    },
    {
      reference: "BIEN-0009",
      title: "Appartement Martil Front de Mer",
      type: "appartement",
      zone: "Martil",
      address: "Bd de la Plage, Martil",
      floor: 3,
      surface: "65",
      rooms: 2,
      bathrooms: 1,
      rentAmount: "4500",
      chargesAmount: "300",
      depositAmount: "9000",
      status: "occupe",
      amenities: ["Vue mer", "Balcon", "Parking", "Ascenseur"],
      latitude: "35.6156",
      longitude: "-5.2715",
      description: "Appartement en front de mer à Martil, station balnéaire prisée.",
    },
    {
      reference: "BIEN-0010",
      title: "Studio Fnideq",
      type: "studio",
      zone: "Fnideq",
      address: "Rue Hassan II, Fnideq",
      floor: 2,
      surface: "38",
      rooms: 1,
      bathrooms: 1,
      rentAmount: "2500",
      chargesAmount: "150",
      depositAmount: "5000",
      status: "disponible",
      amenities: ["Meublé", "Wifi", "Cuisine équipée"],
      latitude: "35.8508",
      longitude: "-5.3541",
      description: "Studio meublé idéal pour jeunes actifs ou étudiants.",
    },
  ]).returning();

  console.log(`Created ${properties.length} properties`);

  // Tenants
  const tenants = await db.insert(tenantsTable).values([
    {
      firstName: "Karim",
      lastName: "Benali",
      cin: "BE123456",
      email: "k.benali@gmail.com",
      phone: "+212 661-234567",
      profession: "Ingénieur informatique",
      nationality: "Marocaine",
      dateOfBirth: "1985-03-15",
      emergencyContact: "Fatima Benali",
      emergencyPhone: "+212 661-234568",
      status: "actif",
      propertyId: properties[0].id,
      rentAmount: "8500",
      balance: "0",
      paymentScore: 95,
      notes: "Locataire exemplaire, paiements réguliers.",
    },
    {
      firstName: "Sophie",
      lastName: "Durand",
      cin: "EXPAT-FR-001",
      email: "s.durand@airbus.com",
      phone: "+212 662-345678",
      profession: "Expat - Ingénieure Aéronautique",
      nationality: "Française",
      dateOfBirth: "1978-07-22",
      emergencyContact: "Pierre Durand",
      emergencyPhone: "+33 612-345678",
      status: "actif",
      propertyId: properties[1].id,
      rentAmount: "18000",
      balance: "0",
      paymentScore: 100,
      notes: "Expatriée Airbus, contrat entreprise. Très fiable.",
    },
    {
      firstName: "Mohammed",
      lastName: "Oulad Taleb",
      cin: "BH456789",
      email: "m.ouladtaleb@hotmail.com",
      phone: "+212 663-456789",
      profession: "Artisan",
      nationality: "Marocaine",
      dateOfBirth: "1972-11-08",
      status: "en_retard",
      propertyId: properties[2].id,
      rentAmount: "3500",
      balance: "-7000",
      paymentScore: 45,
      notes: "Retard de 2 mois. Relances envoyées le 15 et 25 du mois.",
    },
    {
      firstName: "Salma",
      lastName: "El Idrissi",
      cin: "BJ789012",
      email: "salma.elidrissi@gmail.com",
      phone: "+212 664-567890",
      profession: "Directrice Marketing",
      nationality: "Marocaine",
      dateOfBirth: "1988-04-30",
      emergencyContact: "Hassan El Idrissi",
      emergencyPhone: "+212 664-567891",
      status: "actif",
      propertyId: properties[3].id,
      rentAmount: "12000",
      balance: "0",
      paymentScore: 88,
    },
    {
      firstName: "Carlos",
      lastName: "Mendez",
      cin: "EXPAT-ES-001",
      email: "c.mendez@renault.ma",
      phone: "+212 665-678901",
      profession: "Expat - Responsable Usine",
      nationality: "Espagnole",
      dateOfBirth: "1975-09-12",
      status: "actif",
      propertyId: properties[6].id,
      rentAmount: "14000",
      balance: "0",
      paymentScore: 98,
      notes: "Expatrié Renault Tanger. Paiements via virement bancaire.",
    },
    {
      firstName: "Amina",
      lastName: "Tahiri",
      cin: "BK012345",
      email: "a.tahiri@gmail.com",
      phone: "+212 666-789012",
      profession: "Commerçante",
      nationality: "Marocaine",
      dateOfBirth: "1965-12-20",
      status: "actif",
      propertyId: properties[7].id,
      rentAmount: "9000",
      balance: "0",
      paymentScore: 82,
      notes: "Exploite un magasin de vêtements.",
    },
    {
      firstName: "Youssef",
      lastName: "Bargach",
      cin: "BL234567",
      email: "y.bargach@outlook.com",
      phone: "+212 667-890123",
      profession: "Médecin",
      nationality: "Marocaine",
      dateOfBirth: "1980-06-15",
      status: "actif",
      propertyId: properties[8].id,
      rentAmount: "4500",
      balance: "0",
      paymentScore: 92,
    },
  ]).returning();

  console.log(`Created ${tenants.length} tenants`);

  // Update properties with current tenant IDs
  await db.update(propertiesTable).set({ currentTenantId: tenants[0].id }).where(sql`id = ${properties[0].id}`);
  await db.update(propertiesTable).set({ currentTenantId: tenants[1].id }).where(sql`id = ${properties[1].id}`);
  await db.update(propertiesTable).set({ currentTenantId: tenants[2].id }).where(sql`id = ${properties[2].id}`);
  await db.update(propertiesTable).set({ currentTenantId: tenants[3].id }).where(sql`id = ${properties[3].id}`);
  await db.update(propertiesTable).set({ currentTenantId: tenants[4].id }).where(sql`id = ${properties[6].id}`);
  await db.update(propertiesTable).set({ currentTenantId: tenants[5].id }).where(sql`id = ${properties[7].id}`);
  await db.update(propertiesTable).set({ currentTenantId: tenants[6].id }).where(sql`id = ${properties[8].id}`);

  // Payments (last 12 months)
  const currentDate = new Date();
  const paymentData = [];
  let payRef = 1;

  const paymentConfigs = [
    { tenant: tenants[0], property: properties[0], amount: 8500, goodPayer: true },
    { tenant: tenants[1], property: properties[1], amount: 18000, goodPayer: true },
    { tenant: tenants[2], property: properties[2], amount: 3500, goodPayer: false },
    { tenant: tenants[3], property: properties[3], amount: 12000, goodPayer: true },
    { tenant: tenants[4], property: properties[6], amount: 14000, goodPayer: true },
    { tenant: tenants[5], property: properties[7], amount: 9000, goodPayer: true },
    { tenant: tenants[6], property: properties[8], amount: 4500, goodPayer: true },
  ];

  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsAgo, 1);
    const monthKey = d.toISOString().slice(0, 7);
    const dueDate = `${monthKey}-05`;
    const isCurrentMonth = monthsAgo === 0;
    const isPastMonth = monthsAgo > 0;

    for (const config of paymentConfigs) {
      let status = "en_attente";
      let paidAmount = "0";
      let paidDate = null;
      let paymentMethod = null;

      if (isPastMonth) {
        if (config.goodPayer) {
          status = "paye";
          paidAmount = config.amount.toString();
          const pd = new Date(d.getFullYear(), d.getMonth(), Math.floor(Math.random() * 5) + 3);
          paidDate = pd.toISOString().split("T")[0];
          paymentMethod = ["virement", "cheque", "virement", "virement"][Math.floor(Math.random() * 4)];
        } else {
          if (monthsAgo > 2) {
            status = "paye";
            paidAmount = config.amount.toString();
            const pd = new Date(d.getFullYear(), d.getMonth(), 20);
            paidDate = pd.toISOString().split("T")[0];
            paymentMethod = "especes";
          } else if (monthsAgo === 1) {
            status = "partiel";
            paidAmount = (config.amount * 0.5).toString();
            paidDate = `${monthKey}-28`;
            paymentMethod = "especes";
          } else if (monthsAgo === 2) {
            status = "en_retard";
            paidAmount = "0";
          }
        }
      } else {
        if (config.goodPayer) {
          const todayDay = currentDate.getDate();
          if (todayDay >= 5) {
            status = "paye";
            paidAmount = config.amount.toString();
            paidDate = `${monthKey}-0${Math.min(todayDay, 9)}`;
            paymentMethod = "virement";
          }
        } else {
          status = "en_retard";
        }
      }

      paymentData.push({
        reference: `PAY-${String(payRef++).padStart(5, "0")}`,
        tenantId: config.tenant.id,
        propertyId: config.property.id,
        amount: config.amount.toString(),
        paidAmount,
        dueDate,
        paidDate,
        status,
        paymentMethod,
        penaltyAmount: status === "en_retard" ? "500" : "0",
        receiptNumber: status === "paye" ? `REC-${Date.now()}-${payRef}` : null,
        month: monthKey,
      });
    }
  }

  await db.insert(paymentsTable).values(paymentData);
  console.log(`Created ${paymentData.length} payments`);

  // Contracts
  const contracts = await db.insert(contractsTable).values([
    {
      reference: "CONT-0001",
      tenantId: tenants[0].id,
      propertyId: properties[0].id,
      startDate: "2023-01-01",
      endDate: "2025-12-31",
      rentAmount: "8500",
      chargesAmount: "500",
      depositAmount: "17000",
      depositPaid: true,
      type: "bail_habitation",
      status: "actif",
      renewalNoticeDate: "2025-10-01",
      witnessName: "Ahmed Benali",
      witnessPhone: "+212 661-111222",
    },
    {
      reference: "CONT-0002",
      tenantId: tenants[1].id,
      propertyId: properties[1].id,
      startDate: "2024-03-01",
      endDate: "2026-02-28",
      rentAmount: "18000",
      chargesAmount: "1200",
      depositAmount: "36000",
      depositPaid: true,
      type: "bail_habitation",
      status: "actif",
      witnessName: "Jean-Paul Martin",
      witnessPhone: "+33 601-234567",
      specialConditions: "Paiement par virement bancaire mensuel. Contrat au nom de la société Airbus Group Maroc.",
    },
    {
      reference: "CONT-0003",
      tenantId: tenants[2].id,
      propertyId: properties[2].id,
      startDate: "2022-06-01",
      endDate: "2025-05-31",
      rentAmount: "3500",
      chargesAmount: "200",
      depositAmount: "7000",
      depositPaid: true,
      type: "bail_habitation",
      status: "actif",
      renewalNoticeDate: "2025-03-01",
    },
    {
      reference: "CONT-0004",
      tenantId: tenants[3].id,
      propertyId: properties[3].id,
      startDate: "2024-01-15",
      endDate: "2025-06-30",
      rentAmount: "12000",
      chargesAmount: "800",
      depositAmount: "24000",
      depositPaid: true,
      type: "bail_commercial",
      status: "actif",
      renewalNoticeDate: "2025-04-30",
      specialConditions: "Bail commercial renouvelable. Indexation annuelle sur l'IPC.",
    },
    {
      reference: "CONT-0005",
      tenantId: tenants[4].id,
      propertyId: properties[6].id,
      startDate: "2023-09-01",
      endDate: "2025-08-31",
      rentAmount: "14000",
      chargesAmount: "900",
      depositAmount: "28000",
      depositPaid: true,
      type: "bail_habitation",
      status: "actif",
    },
    {
      reference: "CONT-0006",
      tenantId: tenants[5].id,
      propertyId: properties[7].id,
      startDate: "2023-04-01",
      endDate: "2025-03-31",
      rentAmount: "9000",
      chargesAmount: "600",
      depositAmount: "18000",
      depositPaid: true,
      type: "bail_commercial",
      status: "actif",
      renewalNoticeDate: "2025-01-31",
    },
    {
      reference: "CONT-0007",
      tenantId: tenants[6].id,
      propertyId: properties[8].id,
      startDate: "2024-06-01",
      endDate: "2026-05-31",
      rentAmount: "4500",
      chargesAmount: "300",
      depositAmount: "9000",
      depositPaid: true,
      type: "bail_habitation",
      status: "actif",
    },
  ]).returning();

  console.log(`Created ${contracts.length} contracts`);

  // Maintenance tickets
  const maintenance = await db.insert(maintenanceTable).values([
    {
      reference: "MAINT-0001",
      title: "Fuite robinet cuisine",
      description: "Fuite importante au niveau du robinet de la cuisine. Locataire signale des dégâts d'humidité sur le meuble sous-évier.",
      propertyId: properties[0].id,
      tenantId: tenants[0].id,
      category: "plomberie",
      priority: "haute",
      status: "en_cours",
      technicianName: "Hassan Plomberie",
      technicianPhone: "+212 661-999888",
      estimatedCost: "800",
      scheduledDate: "2025-05-03",
    },
    {
      reference: "MAINT-0002",
      title: "Panne climatiseur salon",
      description: "Le climatiseur du salon ne refroidit plus correctement. Besoin d'une révision complète avant l'été.",
      propertyId: properties[1].id,
      tenantId: tenants[1].id,
      category: "climatisation",
      priority: "normale",
      status: "ouvert",
      estimatedCost: "2500",
      scheduledDate: "2025-05-08",
    },
    {
      reference: "MAINT-0003",
      title: "Serrure porte principale bloquée",
      description: "La serrure de la porte d'entrée est bloquée. Locataire ne peut pas fermer correctement le logement.",
      propertyId: properties[2].id,
      tenantId: tenants[2].id,
      category: "serrurerie",
      priority: "urgente",
      status: "ouvert",
      technicianName: "Kamal Serrures",
      technicianPhone: "+212 662-777666",
      estimatedCost: "600",
      scheduledDate: "2025-05-01",
    },
    {
      reference: "MAINT-0004",
      title: "Peinture façade Riad",
      description: "Travaux de peinture extérieure et intérieure du riad pour rénovation complète avant nouvelle location.",
      propertyId: properties[5].id,
      category: "peinture",
      priority: "normale",
      status: "en_cours",
      technicianName: "Équipe Peinture Tanger",
      technicianPhone: "+212 663-555444",
      estimatedCost: "15000",
      actualCost: "12000",
      scheduledDate: "2025-04-15",
    },
    {
      reference: "MAINT-0005",
      title: "Court-circuit tableau électrique",
      description: "Disjoncteur principal qui saute régulièrement. Besoin d'un électricien pour vérification complète.",
      propertyId: properties[3].id,
      tenantId: tenants[3].id,
      category: "electricite",
      priority: "urgente",
      status: "resolu",
      technicianName: "Mohamed Electricité",
      technicianPhone: "+212 661-333222",
      estimatedCost: "3000",
      actualCost: "2800",
      scheduledDate: "2025-04-20",
      completedDate: "2025-04-22",
    },
    {
      reference: "MAINT-0006",
      title: "Nettoyage piscine villa",
      description: "Nettoyage et traitement mensuel de la piscine. Entretien régulier prévu.",
      propertyId: properties[1].id,
      tenantId: tenants[1].id,
      category: "nettoyage",
      priority: "faible",
      status: "resolu",
      technicianName: "Piscine Service Tanger",
      technicianPhone: "+212 664-111000",
      estimatedCost: "1200",
      actualCost: "1200",
      scheduledDate: "2025-04-28",
      completedDate: "2025-04-28",
    },
    {
      reference: "MAINT-0007",
      title: "Infiltrations terrasse",
      description: "Des infiltrations d'eau sont constatées depuis la terrasse lors des pluies. Nécessite une étanchéification.",
      propertyId: properties[0].id,
      tenantId: tenants[0].id,
      category: "autre",
      priority: "haute",
      status: "en_attente_pieces",
      technicianName: "Étanchéité Pro",
      technicianPhone: "+212 662-888777",
      estimatedCost: "5500",
      scheduledDate: "2025-05-10",
    },
  ]).returning();

  console.log(`Created ${maintenance.length} maintenance tickets`);

  // Notifications
  await db.insert(notificationsTable).values([
    {
      type: "payment_due",
      title: "Loyer en retard - Mohammed Oulad Taleb",
      message: "Le loyer de mai 2025 pour le Studio Médina (3 500 MAD) n'a pas été réglé. Le locataire est en retard de 2 mois.",
      isRead: false,
      entityId: tenants[2].id,
      entityType: "tenant",
    },
    {
      type: "contract_expiring",
      title: "Contrat expirant bientôt - Amina Tahiri",
      message: "Le bail commercial du Local Commercial Iberia expire le 31 mars 2025. Pensez à contacter le locataire pour le renouvellement.",
      isRead: false,
      entityId: contracts[5].id,
      entityType: "contract",
    },
    {
      type: "maintenance_update",
      title: "Ticket urgent - Serrure bloquée Médina",
      message: "Le ticket MAINT-0003 (serrure bloquée Studio Médina) est urgent et non encore assigné. Une intervention doit être planifiée aujourd'hui.",
      isRead: false,
      entityId: maintenance[2].id,
      entityType: "maintenance",
    },
    {
      type: "payment_received",
      title: "Paiement reçu - Sophie Durand",
      message: "Paiement de 18 000 MAD reçu pour la Villa Cap Spartel (mai 2025). Reçu n° REC-2025-05-002 généré.",
      isRead: true,
      entityId: tenants[1].id,
      entityType: "tenant",
    },
    {
      type: "payment_received",
      title: "Paiement reçu - Karim Benali",
      message: "Paiement de 8 500 MAD reçu pour Appartement Malabata (mai 2025). Reçu émis.",
      isRead: true,
      entityId: tenants[0].id,
      entityType: "tenant",
    },
    {
      type: "contract_expiring",
      title: "Contrat expirant - Salma El Idrissi",
      message: "Le bail commercial du Bureau Centre Ville expire le 30 juin 2025. Renouvellement à initier.",
      isRead: false,
      entityId: contracts[3].id,
      entityType: "contract",
    },
    {
      type: "system",
      title: "Bienvenue sur Movia Immo",
      message: "Votre espace de gestion immobilière est prêt. Vous gérez actuellement 10 biens pour 7 locataires actifs à Tanger.",
      isRead: true,
    },
    {
      type: "reminder",
      title: "Rappel: Révision loyers annuelle",
      message: "Pensez à effectuer la révision annuelle des loyers pour les contrats signés avant janvier 2024 conformément à l'IPC.",
      isRead: false,
    },
  ]);

  // Activities
  await db.insert(activitiesTable).values([
    {
      type: "payment",
      description: "Paiement de 18 000 MAD reçu de Sophie Durand pour Villa Cap Spartel",
      entityId: tenants[1].id,
      entityType: "tenant",
    },
    {
      type: "maintenance",
      description: "Ticket MAINT-0003 créé: Serrure porte principale bloquée (Urgente) - Studio Médina",
      entityId: maintenance[2].id,
      entityType: "maintenance",
    },
    {
      type: "payment",
      description: "Paiement de 8 500 MAD reçu de Karim Benali pour Appartement Malabata",
      entityId: tenants[0].id,
      entityType: "tenant",
    },
    {
      type: "contract",
      description: "Alerte: Contrat CONT-0006 expire le 31 mars 2025 - Amina Tahiri",
      entityId: contracts[5].id,
      entityType: "contract",
    },
    {
      type: "maintenance",
      description: "Ticket MAINT-0005 résolu: Court-circuit tableau électrique - Bureau Centre Ville",
      entityId: maintenance[4].id,
      entityType: "maintenance",
    },
    {
      type: "tenant",
      description: "Relance envoyée à Mohammed Oulad Taleb pour loyer en retard (2 mois)",
      entityId: tenants[2].id,
      entityType: "tenant",
    },
    {
      type: "property",
      description: "Bien BIEN-0006 (Riad Médina) mis en statut maintenance pour travaux de peinture",
      entityId: properties[5].id,
      entityType: "property",
    },
    {
      type: "payment",
      description: "Paiement de 14 000 MAD reçu de Carlos Mendez pour Villa Tétouan",
      entityId: tenants[4].id,
      entityType: "tenant",
    },
    {
      type: "contract",
      description: "Nouveau contrat CONT-0007 signé avec Youssef Bargach - Appartement Martil",
      entityId: contracts[6].id,
      entityType: "contract",
    },
    {
      type: "payment",
      description: "Paiement partiel de 1 750 MAD reçu de Mohammed Oulad Taleb (50% du loyer)",
      entityId: tenants[2].id,
      entityType: "tenant",
    },
  ]);

  console.log("Seed complete!");
}

seed().catch(console.error).finally(() => process.exit());
