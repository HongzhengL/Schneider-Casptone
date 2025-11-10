const origins = [
    { city: 'Green Bay', state: 'WI', facility: 'Terminal' },
    { city: 'Chicago', state: 'IL', facility: 'Logistics Hub' },
    { city: 'Indianapolis', state: 'IN', facility: 'Freight Yard' },
    { city: 'Des Moines', state: 'IA', facility: 'Distribution Center' },
    { city: 'Kansas City', state: 'MO', facility: 'Regional Hub' },
    { city: 'Louisville', state: 'KY', facility: 'Service Plaza' },
    { city: 'Detroit', state: 'MI', facility: 'Auto Port' },
    { city: 'Cincinnati', state: 'OH', facility: 'River Terminal' },
    { city: 'Memphis', state: 'TN', facility: 'Crossdock' },
    { city: 'St. Louis', state: 'MO', facility: 'Gateway Hub' },
    { city: 'Madison', state: 'WI', facility: 'Consolidation Center' },
    { city: 'Milwaukee', state: 'WI', facility: 'Harbor Depot' },
    { city: 'Omaha', state: 'NE', facility: 'Plains Terminal' },
    { city: 'Tulsa', state: 'OK', facility: 'Energy Yard' },
    { city: 'Little Rock', state: 'AR', facility: 'Southern Hub' },
    { city: 'Minneapolis', state: 'MN', facility: 'North Loop Terminal' },
    { city: 'Cleveland', state: 'OH', facility: 'Lakefront Depot' },
    { city: 'Nashville', state: 'TN', facility: 'Music City Hub' },
    { city: 'Charlotte', state: 'NC', facility: 'Regional Hub' },
    { city: 'Atlanta', state: 'GA', facility: 'Southeast Logistics Center' },
];

const destinations = [
    { city: 'Denver', state: 'CO', facility: 'Rocky Mountain DC' },
    { city: 'Houston', state: 'TX', facility: 'Gulf Coast Distribution' },
    { city: 'Phoenix', state: 'AZ', facility: 'Desert Line Ramp' },
    { city: 'Dallas', state: 'TX', facility: 'Metroplex Depot' },
    { city: 'New Orleans', state: 'LA', facility: 'Port Terminal' },
    { city: 'Jacksonville', state: 'FL', facility: 'Southeast Gateway' },
    { city: 'Charlotte', state: 'NC', facility: 'Atlantic Transfer Yard' },
    { city: 'Savannah', state: 'GA', facility: 'Ocean Terminal' },
    { city: 'Pittsburgh', state: 'PA', facility: 'Steel City Hub' },
    { city: 'Buffalo', state: 'NY', facility: 'Great Lakes DC' },
    { city: 'Scranton', state: 'PA', facility: 'Northeast Transfer' },
    { city: 'Raleigh', state: 'NC', facility: 'Research Triangle Hub' },
    { city: 'Orlando', state: 'FL', facility: 'Sunshine State DC' },
    { city: 'San Antonio', state: 'TX', facility: 'Lone Star Depot' },
    { city: 'El Paso', state: 'TX', facility: 'Border Logistics Center' },
    { city: 'Boise', state: 'ID', facility: 'Mountain View DC' },
    { city: 'Salt Lake City', state: 'UT', facility: 'Wasatch Hub' },
    { city: 'Portland', state: 'OR', facility: 'Cascade Terminal' },
    { city: 'Spokane', state: 'WA', facility: 'Inland Northwest DC' },
    { city: 'Los Angeles', state: 'CA', facility: 'West Coast Gateway' },
    { city: 'Seattle', state: 'WA', facility: 'Puget Sound Ramp' },
    { city: 'San Diego', state: 'CA', facility: 'Border Trade Port' },
    { city: 'Albuquerque', state: 'NM', facility: 'High Desert Hub' },
    { city: 'Billings', state: 'MT', facility: 'Northern Plains DC' },
    { city: 'Cheyenne', state: 'WY', facility: 'Frontier Logistics Center' },
    { city: 'Rapid City', state: 'SD', facility: 'Black Hills Depot' },
    { city: 'Birmingham', state: 'AL', facility: 'Iron City Terminal' },
    { city: 'Charleston', state: 'SC', facility: 'Harbor Logistics Center' },
];

const loadProfiles = [
    {
        type: 'Dry Van',
        customer: 'Walmart',
        baseMiles: 320,
        baseWeight: 38200,
        baseRpm: 1.82,
        rpmStep: 0.08,
        milesStep: 18,
        weightStep: 420,
    },
    {
        type: 'Temperature Control',
        customer: 'US Foods',
        baseMiles: 460,
        baseWeight: 41000,
        baseRpm: 1.98,
        rpmStep: 0.1,
        milesStep: 22,
        weightStep: 380,
    },
    {
        type: 'Schneider Dedicated',
        customer: 'Target',
        baseMiles: 285,
        baseWeight: 35200,
        baseRpm: 1.76,
        rpmStep: 0.06,
        milesStep: 15,
        weightStep: 340,
    },
    {
        type: 'Flatbed',
        customer: 'Nucor Steel',
        baseMiles: 520,
        baseWeight: 48900,
        baseRpm: 2.05,
        rpmStep: 0.09,
        milesStep: 26,
        weightStep: 520,
    },
    {
        type: 'Intermodal',
        customer: 'Schneider Rail',
        baseMiles: 610,
        baseWeight: 44200,
        baseRpm: 1.92,
        rpmStep: 0.07,
        milesStep: 30,
        weightStep: 460,
    },
    {
        type: 'Hazmat',
        customer: 'Dow Chemicals',
        baseMiles: 410,
        baseWeight: 35800,
        baseRpm: 2.18,
        rpmStep: 0.1,
        milesStep: 20,
        weightStep: 260,
    },
    {
        type: 'Power Only',
        customer: 'Amazon Relay',
        baseMiles: 280,
        baseWeight: 21000,
        baseRpm: 1.62,
        rpmStep: 0.05,
        milesStep: 12,
        weightStep: 180,
    },
    {
        type: 'Refrigerated',
        customer: 'Kraft Heinz',
        baseMiles: 430,
        baseWeight: 39800,
        baseRpm: 2.04,
        rpmStep: 0.09,
        milesStep: 24,
        weightStep: 360,
    },
    {
        type: 'Expedited',
        customer: 'FedEx Custom Critical',
        baseMiles: 250,
        baseWeight: 18800,
        baseRpm: 2.45,
        rpmStep: 0.12,
        milesStep: 14,
        weightStep: 140,
    },
    {
        type: 'High Value',
        customer: 'Apple Distribution',
        baseMiles: 375,
        baseWeight: 16500,
        baseRpm: 2.32,
        rpmStep: 0.11,
        milesStep: 18,
        weightStep: 120,
    },
    {
        type: 'Automotive',
        customer: 'GM Components',
        baseMiles: 345,
        baseWeight: 41000,
        baseRpm: 1.88,
        rpmStep: 0.07,
        milesStep: 16,
        weightStep: 390,
    },
    {
        type: 'Bulk Tanker',
        customer: 'Shell Lubricants',
        baseMiles: 480,
        baseWeight: 52500,
        baseRpm: 2.08,
        rpmStep: 0.09,
        milesStep: 28,
        weightStep: 540,
    },
];

const serviceNoteOptions = [
    { id: 'driver-assist-load', label: 'Driver assist load required' },
    { id: 'driver-assist-unload', label: 'Driver assist unload required' },
    { id: 'driver-load', label: 'Driver load required' },
    { id: 'driver-unload', label: 'Driver unload required' },
    { id: 'live-load', label: 'Live load scheduled' },
    { id: 'live-unload', label: 'Live unload on delivery' },
    { id: 'customer-live-load', label: 'Customer live load' },
    { id: 'customer-live-unload', label: 'Customer live unload' },
    { id: 'hazmat', label: 'Hazmat paperwork provided' },
    { id: 'high-value', label: 'High value cargo' },
    { id: 'lumper-load', label: 'Lumper fee at pickup' },
    { id: 'lumper-unload', label: 'Lumper fee at delivery' },
    { id: 'stop-off', label: 'Includes stop-off' },
    { id: 'trailer-spot', label: 'Trailer spot move required' },
    { id: 'trailer-shuttle', label: 'Trailer shuttle between yards' },
    { id: 'pick-up-relay', label: 'Pick-up relay at hub' },
    { id: 'drop-relay', label: 'Drop relay on outbound leg' },
    { id: 'twic', label: 'TWIC badge preferred' },
];

const generalNotes = [
    'Dock appointment set',
    'No weekend delivery',
    'Fuel surcharge included',
    'Tolls reimbursed',
    'Flexible appointment window',
    'Overnight parking available',
    'Scale ticket required',
    'Dedicated dispatcher support',
    '24/7 yard access available',
    'Carrier must call 1 hour ahead',
];

const terminalSuffixes = ['A', 'B', 'C', 'D', 'E', 'F'];
const zoneMarkers = ['North', 'Central', 'South', 'East', 'West'];

const toCurrency = (value) =>
    `$${Math.round(value).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

const toMiles = (value) => `${value.toFixed(1)} miles`;

const toWeight = (value) => `${Math.round(value).toLocaleString()} lb`;

const formatDisplayDate = (date) =>
    date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const baseDate = startOfDay(new Date());

const uniqueDestination = (origin, candidateIndex, attempt = 0) => {
    const destination = destinations[candidateIndex % destinations.length];
    if (
        destination.city === origin.city &&
        destination.state === origin.state &&
        attempt < destinations.length
    ) {
        return uniqueDestination(origin, candidateIndex + 5, attempt + 1);
    }
    return destination;
};

export const findLoads = Array.from({ length: 100 }, (_, idx) => {
    const originBase = origins[idx % origins.length];
    const destBase = uniqueDestination(
        originBase,
        (idx * 7 + Math.floor(idx / 3)) % destinations.length
    );
    const loadProfile = loadProfiles[idx % loadProfiles.length];
    const sequence = Math.floor(idx / origins.length);

    const fromLocation = `${originBase.city}, ${originBase.state} (${originBase.facility} ${
        terminalSuffixes[idx % terminalSuffixes.length]
    } - ${zoneMarkers[(idx + sequence) % zoneMarkers.length]} Gate)`;
    const toLocation = `${destBase.city}, ${destBase.state} (${destBase.facility} ${
        zoneMarkers[(idx + 2 * sequence) % zoneMarkers.length]
    })`;

    const pickupDate = addDays(baseDate, idx);
    pickupDate.setHours(6 + (idx % 8) * 2, (idx % 4) * 15);

    const deliveryDate = addDays(pickupDate, 1 + (idx % 3));
    deliveryDate.setHours(pickupDate.getHours() + 6 + (idx % 5), pickupDate.getMinutes());

    const addedDate = addDays(pickupDate, -3 - (idx % 4));

    const distanceNum = Number(
        (loadProfile.baseMiles + sequence * 14 + (idx % 13) * loadProfile.milesStep * 0.45).toFixed(
            1
        )
    );
    const weightNum = Math.round(
        loadProfile.baseWeight + sequence * 520 + (idx % 9) * loadProfile.weightStep
    );
    const rpm = Number(
        (loadProfile.baseRpm + sequence * 0.05 + (idx % 5) * loadProfile.rpmStep).toFixed(2)
    );
    const priceNum = Math.round(distanceNum * rpm);

    const loadedRpmNum = rpm;
    const totalRpmNum = Number((rpm - 0.12 - (idx % 4) * 0.05).toFixed(2));

    // Compute distance to origin first; used by RCPM
    const distanceToOrigin = Number((8.5 + (idx % 27) * 2.25 + sequence * 1.75).toFixed(1));
    // Revenue per Combined Mile (heuristic): includes deadhead to origin
    const rcpmBaseMiles = distanceNum + distanceToOrigin;
    const rcpmNum = Number((priceNum / Math.max(1, rcpmBaseMiles)).toFixed(2));

    const serviceNoteCount = 1 + ((idx + sequence) % 2);
    const serviceNotes = [];
    let offset = 0;
    while (serviceNotes.length < serviceNoteCount) {
        const candidate =
            serviceNoteOptions[(idx + offset * 3 + sequence) % serviceNoteOptions.length];
        if (!serviceNotes.some((note) => note.id === candidate.id)) {
            serviceNotes.push(candidate);
        }
        offset++;
    }

    const serviceTags = serviceNotes.map((note) => note.id);
    const serviceNoteLabels = serviceNotes.map((note) => note.label);
    const generalNote = generalNotes[(idx + sequence) % generalNotes.length];
    const confirmedAppointment = (idx + sequence) % 4 !== 1;

    const sni = 4700 + idx;

    return {
        id: String(idx + 1),
        price: toCurrency(priceNum),
        priceNum,
        distance: toMiles(distanceNum),
        distanceNum,
        weight: toWeight(weightNum),
        weightNum,
        loadedRpm: `$${loadedRpmNum.toFixed(2)}`,
        loadedRpmNum,
        totalRpm: `$${totalRpmNum.toFixed(2)}`,
        totalRpmNum,
        rcpm: `$${rcpmNum.toFixed(2)}`,
        rcpmNum,
        loadType: loadProfile.type,
        fromLocation,
        fromDate: formatDisplayDate(pickupDate),
        pickupDate,
        toLocation,
        toDate: formatDisplayDate(deliveryDate),
        details: `Customer: ${loadProfile.customer}\n${[...serviceNoteLabels, generalNote].join(
            '\n'
        )}\nSNI-${sni}`,
        customer: loadProfile.customer,
        serviceTags,
        hasReload: (idx + sequence) % 3 === 0,
        confirmedAppointment,
        distanceToOrigin,
        addedDate,
        dropDate: deliveryDate,
    };
});
