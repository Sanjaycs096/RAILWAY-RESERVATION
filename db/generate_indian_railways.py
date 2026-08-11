import random
import json
from datetime import datetime, timedelta
import time

# Indian Railways Zones
ZONES = [
    ('CR', 'Central Railway'),
    ('ER', 'Eastern Railway'),
    ('ECR', 'East Central Railway'),
    ('NR', 'Northern Railway'),
    ('NCR', 'North Central Railway'),
    ('NER', 'North Eastern Railway'),
    ('NWR', 'North Western Railway'),
    ('SR', 'Southern Railway'),
    ('SCR', 'South Central Railway'),
    ('SER', 'South Eastern Railway'),
    ('SECR', 'South East Central Railway'),
    ('SWR', 'South Western Railway'),
    ('WR', 'Western Railway'),
    ('WCR', 'West Central Railway')
]

# Major Indian Stations with realistic data
STATIONS = [
    # Northern Railway (NR)
    ('NDLS', 'New Delhi', 'Delhi', 'Delhi', 'NR', 28.6139, 77.2090),
    ('NZM', 'Hazrat Nizamuddin', 'Delhi', 'Delhi', 'NR', 28.5916, 77.2733),
    ('DLI', 'Delhi Junction', 'Delhi', 'Delhi', 'NR', 28.6612, 77.2284),
    ('CNB', 'Kanpur Central', 'Kanpur', 'Uttar Pradesh', 'NR', 26.4499, 80.3319),
    ('LKO', 'Lucknow Charbagh', 'Lucknow', 'Uttar Pradesh', 'NR', 26.8467, 80.9462),
    ('PRYJ', 'Prayagraj Junction', 'Prayagraj', 'Uttar Pradesh', 'NR', 25.4358, 81.8463),
    ('VNS', 'Varanasi Junction', 'Varanasi', 'Uttar Pradesh', 'NR', 25.3176, 82.9739),
    ('ASR', 'Amritsar Junction', 'Amritsar', 'Punjab', 'NR', 31.6340, 74.8723),
    ('JUC', 'Jalandhar City', 'Jalandhar', 'Punjab', 'NR', 31.3455, 75.5768),
    ('LDH', 'Ludhiana Junction', 'Ludhiana', 'Punjab', 'NR', 30.9030, 75.8574),
    ('CDG', 'Chandigarh Junction', 'Chandigarh', 'Chandigarh', 'NR', 30.7333, 76.7794),
    ('UHP', 'Udhampur', 'Udhampur', 'Jammu & Kashmir', 'NR', 32.9235, 75.1461),
    ('JAT', 'Jammu Tawi', 'Jammu', 'Jammu & Kashmir', 'NR', 32.7266, 74.8570),
    ('SVDK', 'Shri Mata Vaishno Devi Katra', 'Katra', 'Jammu & Kashmir', 'NR', 32.9855, 74.9520),
    
    # Western Railway (WR)
    ('MMCT', 'Mumbai Central', 'Mumbai', 'Maharashtra', 'WR', 18.9696, 72.8194),
    ('BCT', 'Mumbai CST', 'Mumbai', 'Maharashtra', 'WR', 18.9342, 72.8359),
    ('BDTS', 'Bandra Terminus', 'Mumbai', 'Maharashtra', 'WR', 19.0574, 72.8410),
    ('PNVL', 'Panvel Junction', 'Panvel', 'Maharashtra', 'WR', 19.0050, 73.1129),
    ('BRC', 'Vadodara Junction', 'Vadodara', 'Gujarat', 'WR', 22.3072, 73.1812),
    ('ADI', 'Ahmedabad Junction', 'Ahmedabad', 'Gujarat', 'WR', 23.0250, 72.5877),
    ('SURAT', 'Surat Junction', 'Surat', 'Gujarat', 'WR', 21.1702, 72.8311),
    ('RJT', 'Rajkot Junction', 'Rajkot', 'Gujarat', 'WR', 22.2953, 70.7936),
    ('JAM', 'Jamnagar', 'Jamnagar', 'Gujarat', 'WR', 22.4707, 70.0577),
    ('PBR', 'Porbandar', 'Porbandar', 'Gujarat', 'WR', 21.6419, 69.6003),
    ('BHUJ', 'Bhuj', 'Bhuj', 'Gujarat', 'WR', 23.2414, 69.6669),
    
    # Southern Railway (SR)
    ('MAS', 'Chennai Central', 'Chennai', 'Tamil Nadu', 'SR', 13.0827, 80.2707),
    ('MS', 'Chennai Egmore', 'Chennai', 'Tamil Nadu', 'SR', 13.0749, 80.2577),
    ('TBM', 'Tambaram', 'Chennai', 'Tamil Nadu', 'SR', 12.9243, 80.1228),
    ('CBE', 'Coimbatore Junction', 'Coimbatore', 'Tamil Nadu', 'SR', 11.0050, 76.9732),
    ('TVC', 'Thiruvananthapuram Central', 'Thiruvananthapuram', 'Kerala', 'SR', 8.4875, 76.9486),
    ('ERS', 'Ernakulam Junction', 'Kochi', 'Kerala', 'SR', 9.9679, 76.2759),
    ('MYS', 'Mysuru Junction', 'Mysuru', 'Karnataka', 'SWR', 12.3175, 76.6491),
    ('SBC', 'KSR Bengaluru', 'Bengaluru', 'Karnataka', 'SWR', 12.9793, 77.5927),
    ('YPR', 'Yesvantpur Junction', 'Bengaluru', 'Karnataka', 'SWR', 13.0319, 77.5475),
    ('MAQ', 'Mangaluru Central', 'Mangaluru', 'Karnataka', 'SR', 12.8692, 74.8441),
    
    # Eastern Railway (ER)
    ('HWH', 'Howrah Junction', 'Kolkata', 'West Bengal', 'ER', 22.5771, 88.3200),
    ('SDAH', 'Sealdah', 'Kolkata', 'West Bengal', 'ER', 22.5687, 88.3777),
    ('KOAA', 'Kolkata', 'Kolkata', 'West Bengal', 'ER', 22.5658, 88.3441),
    ('DGR', 'Durgapur', 'Durgapur', 'West Bengal', 'ER', 23.4951, 87.2910),
    ('ASN', 'Asansol Junction', 'Asansol', 'West Bengal', 'ER', 23.6837, 86.9884),
    ('RNC', 'Ranchi Junction', 'Ranchi', 'Jharkhand', 'SER', 23.3675, 85.3411),
    ('BRR', 'Barauni Junction', 'Barauni', 'Bihar', 'ECR', 25.4053, 85.9871),
    ('PNBE', 'Patna Junction', 'Patna', 'Bihar', 'ECR', 25.6108, 85.1416),
    ('GAYA', 'Gaya Junction', 'Gaya', 'Bihar', 'ECR', 24.7850, 85.0156),
    
    # South Central Railway (SCR)
    ('SC', 'Secunderabad Junction', 'Hyderabad', 'Telangana', 'SCR', 17.4399, 78.4982),
    ('HYB', 'Hyderabad Deccan', 'Hyderabad', 'Telangana', 'SCR', 17.3665, 78.4669),
    ('KCG', 'Kacheguda', 'Hyderabad', 'Telangana', 'SCR', 17.3833, 78.4910),
    ('NJP', 'New Jalpaiguri', 'Siliguri', 'West Bengal', 'NFR', 26.6800, 88.4636),
    ('GHY', 'Guwahati', 'Guwahati', 'Assam', 'NFR', 26.1795, 91.7600),
    ('DIBR', 'Dibrugarh', 'Dibrugarh', 'Assam', 'NFR', 27.4729, 95.0038),
    
    # Additional Important Stations
    ('BPL', 'Bhopal Junction', 'Bhopal', 'Madhya Pradesh', 'WCR', 23.2642, 77.3975),
    ('JBP', 'Jabalpur Junction', 'Jabalpur', 'Madhya Pradesh', 'WCR', 23.1700, 79.9500),
    ('NED', 'Nanded', 'Nanded', 'Maharashtra', 'SCR', 19.1510, 77.3052),
    ('PUNE', 'Pune Junction', 'Pune', 'Maharashtra', 'CR', 18.5284, 73.8737),
    ('NGP', 'Nagpur Junction', 'Nagpur', 'Maharashtra', 'CR', 21.1480, 79.0882),
    ('AJNI', 'Ajni', 'Nagpur', 'Maharashtra', 'CR', 21.1229, 79.0618),
    ('ITR', 'Itarsi Junction', 'Itarsi', 'Madhya Pradesh', 'WCR', 22.6074, 77.7609),
    ('KOTA', 'Kota Junction', 'Kota', 'Rajasthan', 'WCR', 25.1883, 75.8395),
    ('JP', 'Jaipur Junction', 'Jaipur', 'Rajasthan', 'NWR', 26.8667, 75.7833),
    ('JU', 'Jodhpur Junction', 'Jodhpur', 'Rajasthan', 'NWR', 26.2855, 73.0211),
    ('BKN', 'Bikaner Junction', 'Bikaner', 'Rajasthan', 'NWR', 28.0286, 73.3118),
    ('AII', 'Ajmer Junction', 'Ajmer', 'Rajasthan', 'NWR', 26.4625, 74.6386),
    ('MTJ', 'Mathura Junction', 'Mathura', 'Uttar Pradesh', 'NCR', 27.4800, 77.6800),
    ('AGC', 'Agra Cantt', 'Agra', 'Uttar Pradesh', 'NCR', 27.1555, 78.0122),
    ('MFP', 'Muzaffarpur Junction', 'Muzaffarpur', 'Bihar', 'ECR', 26.1210, 85.3900),
    ('DBG', 'Darbhanga Junction', 'Darbhanga', 'Bihar', 'ECR', 26.1540, 85.8910),
    ('SLR', 'Sasaram', 'Sasaram', 'Bihar', 'ECR', 24.9667, 84.0333),
    ('DDU', 'Pt. Deen Dayal Upadhyaya Junction', 'Mughalsarai', 'Uttar Pradesh', 'ECR', 25.2771, 82.9320),
    ('MGS', 'Mughalsarai Junction', 'Mughalsarai', 'Uttar Pradesh', 'ECR', 25.2771, 82.9320),
    ('BSB', 'Varanasi Junction', 'Varanasi', 'Uttar Pradesh', 'NR', 25.3176, 82.9739)
]

# Train Types and their typical properties
TRAIN_TYPES = [
    ('Rajdhani Express', True, ['1A', '2A', '3A']),
    ('Shatabdi Express', True, ['CC', 'EC']),
    ('Duronto Express', True, ['1A', '2A', '3A', 'SL']),
    ('Vande Bharat', True, ['CC', 'EC']),
    ('Garib Rath', False, ['3A']),
    ('Superfast Express', True, ['1A', '2A', '3A', 'SL', '2S']),
    ('Express', False, ['3A', 'SL', '2S', 'GN']),
    ('Passenger', False, ['SL', '2S', 'GN']),
    ('Mail Express', False, ['SL', '2S', 'GN']),
    ('Jan Shatabdi', False, ['CC', '2S'])
]

def generate_all_train_numbers():
    """Pre-generate a pool of valid train numbers"""
    all_numbers = set()
    
    for train_type, _, _ in TRAIN_TYPES:
        prefixes = {
            'Rajdhani Express': ['12', '22', '23'],
            'Shatabdi Express': ['12', '20', '22'],
            'Duronto Express': ['12', '22', '24'],
            'Vande Bharat': ['18', '20', '22'],
            'Garib Rath': ['12', '22'],
            'Superfast Express': ['12', '12', '12', '22', '22', '22', '22', '22'],
            'Express': ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'],
            'Passenger': ['50', '51', '52', '53', '54', '55', '56', '57'],
            'Mail Express': ['10', '11', '12', '13', '14', '15', '16'],
            'Jan Shatabdi': ['12', '20']
        }
        
        for prefix in prefixes.get(train_type, ['12']):
            for suffix in range(1, 100):
                number = prefix + str(suffix).zfill(2)
                if number not in [t[0] for t in all_numbers]:
                    all_numbers.add((number, train_type))
    
    return list(all_numbers)

def calculate_distance(station1, station2):
    """Calculate distance between two stations"""
    lat1, lon1 = station1[5], station1[6]
    lat2, lon2 = station2[5], station2[6]
    return int(((lat1 - lat2)**2 + (lon1 - lon2)**2)**0.5 * 111)

def format_duration(minutes):
    """Format duration for PostgreSQL interval"""
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}:00"

def generate_trains_fast(num_trains=1000):
    """Fast generation using pre-computed station pairs"""
    print(f"Generating {num_trains} trains...")
    start_time = time.time()
    
    all_train_numbers = generate_all_train_numbers()
    random.shuffle(all_train_numbers)
    
    station_pairs = []
    for i, s1 in enumerate(STATIONS):
        for s2 in STATIONS[i+1:]:
            dist = calculate_distance(s1, s2)
            if dist > 50:
                station_pairs.append((s1, s2, dist))
    
    print(f"Found {len(station_pairs)} station pairs with distance > 50km")
    print(f"Available train numbers: {len(all_train_numbers)}")
    
    num_trains = min(num_trains, len(all_train_numbers))
    
    trains = []
    city_names = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bengaluru', 
                 'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow']
    
    for i in range(num_trains):
        if i % 100 == 0 and i > 0:
            print(f"Generated {i}/{num_trains} trains...")
        
        train_number, train_type = all_train_numbers[i % len(all_train_numbers)]
        
        train_type_info = next(t for t in TRAIN_TYPES if t[0] == train_type)
        has_pantry = train_type_info[1]
        classes = train_type_info[2]
        
        source, dest, distance = random.choice(station_pairs)
        
        # Generate train name
        name_prefix = random.choice(['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bengaluru', 
                                    'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow'])
        train_name = f"{name_prefix} {train_type.split()[0] if 'Express' in train_type else train_type}"
        
        # Generate departure time
        departure_hour = random.randint(5, 23)
        departure_minute = random.choice([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
        departure_time = f"{departure_hour:02d}:{departure_minute:02d}:00"
        
        # Calculate travel time
        avg_speed = random.randint(55, 90)
        duration_minutes = int((distance / avg_speed) * 60)
        total_duration = format_duration(duration_minutes)
        
        # Calculate arrival
        dep_dt = datetime.strptime(departure_time, '%H:%M:%S')
        arr_dt = dep_dt + timedelta(minutes=duration_minutes)
        arrival_time = arr_dt.strftime('%H:%M:%S')
        
        # Days of operation
        runs_pattern = random.choice(['daily', 'weekdays', 'weekends'])
        if runs_pattern == 'daily':
            runs_on = [True, True, True, True, True, True, True]
        elif runs_pattern == 'weekdays':
            runs_on = [True, True, True, True, True, False, False]
        else:
            runs_on = [False, False, False, False, False, True, True]
        
        total_coaches = random.randint(8, 24)
        
        train = {
            'train_number': train_number,
            'train_name': train_name.replace("'", "''"),
            'train_type': train_type,
            'zone': source[4],
            'has_pantry': has_pantry,
            'source_station_code': source[0],
            'destination_station_code': dest[0],
            'departure_time': departure_time,
            'arrival_time': arrival_time,
            'total_duration': total_duration,
            'total_distance_km': distance,
            'runs_on_mon': runs_on[0],
            'runs_on_tue': runs_on[1],
            'runs_on_wed': runs_on[2],
            'runs_on_thu': runs_on[3],
            'runs_on_fri': runs_on[4],
            'runs_on_sat': runs_on[5],
            'runs_on_sun': runs_on[6],
            'available_classes': json.dumps(classes),
            'total_coaches': total_coaches
        }
        trains.append(train)
    
    elapsed = time.time() - start_time
    print(f"✅ Generated {num_trains} trains in {elapsed:.2f} seconds")
    return trains

def generate_route_stops_fast(trains):
    """Generate route stops efficiently"""
    print("Generating route stops...")
    start_time = time.time()
    
    route_stops = []
    station_dict = {s[0]: s for s in STATIONS}
    
    for idx, train in enumerate(trains):
        if idx % 100 == 0 and idx > 0:
            print(f"Processed {idx}/{len(trains)} trains for routes...")
        
        source = station_dict[train['source_station_code']]
        dest = station_dict[train['destination_station_code']]
        
        num_stops = random.randint(2, 4)
        possible_stops = [s for s in STATIONS if s[0] not in [source[0], dest[0]]]
        
        route_stops_list = [source]
        if num_stops > 0 and len(possible_stops) >= num_stops:
            selected = random.sample(possible_stops, min(num_stops, len(possible_stops)))
            selected.sort(key=lambda s: calculate_distance(source, s))
            route_stops_list.extend(selected)
        route_stops_list.append(dest)
        
        dep_time = datetime.strptime(train['departure_time'], '%H:%M:%S')
        total_distance = 0
        
        for stop_idx, stop in enumerate(route_stops_list):
            if stop_idx > 0:
                prev_stop = route_stops_list[stop_idx-1]
                segment_distance = calculate_distance(prev_stop, stop)
                total_distance += segment_distance
                
                avg_speed = random.randint(55, 80)
                travel_mins = max(1, int((segment_distance / avg_speed) * 60))
                dep_time += timedelta(minutes=travel_mins)
            
            if stop_idx == 0:
                route_stops.append({
                    'train_number': train['train_number'],
                    'station_code': stop[0],
                    'stop_sequence': 1,
                    'arrival_time': None,
                    'departure_time': train['departure_time'],
                    'halt_minutes': 0,
                    'distance_from_source_km': 0,
                    'day_number': 1
                })
            elif stop_idx == len(route_stops_list) - 1:
                route_stops.append({
                    'train_number': train['train_number'],
                    'station_code': stop[0],
                    'stop_sequence': stop_idx + 1,
                    'arrival_time': train['arrival_time'],
                    'departure_time': None,
                    'halt_minutes': 0,
                    'distance_from_source_km': total_distance,
                    'day_number': 1
                })
            else:
                arrival_time = dep_time.strftime('%H:%M:%S')
                halt_mins = random.randint(1, 5)
                dep_time += timedelta(minutes=halt_mins)
                
                day_number = 2 if dep_time.hour < 6 and stop_idx > 1 else 1
                
                route_stops.append({
                    'train_number': train['train_number'],
                    'station_code': stop[0],
                    'stop_sequence': stop_idx + 1,
                    'arrival_time': arrival_time,
                    'departure_time': dep_time.strftime('%H:%M:%S'),
                    'halt_minutes': halt_mins,
                    'distance_from_source_km': total_distance,
                    'day_number': day_number
                })
    
    elapsed = time.time() - start_time
    print(f"✅ Generated route stops in {elapsed:.2f} seconds")
    return route_stops

def generate_fares_fast(trains):
    """Generate fares efficiently"""
    print("Generating fares...")
    start_time = time.time()
    
    class_base_fares = {
        '1A': (3000, 6000),
        '2A': (1500, 3500),
        '3A': (800, 2000),
        'SL': (300, 1000),
        '2S': (150, 400),
        'CC': (400, 1200),
        'EC': (800, 2000),
        'GN': (100, 300)
    }
    
    fares = []
    for train in trains:
        classes = json.loads(train['available_classes'])
        for class_code in classes:
            if class_code in class_base_fares:
                base_min, base_max = class_base_fares[class_code]
                distance_factor = train['total_distance_km'] / 1000
                base_fare = int(random.randint(base_min, base_max) * (0.5 + distance_factor * 0.5))
                tatkal_charge = int(base_fare * random.uniform(0.1, 0.2))
                reservation_charge = max(20, int(base_fare * random.uniform(0.02, 0.05)))
                
                fares.append({
                    'train_number': train['train_number'],
                    'class_code': class_code,
                    'base_fare': base_fare,
                    'tatkal_charge': tatkal_charge,
                    'reservation_charge': reservation_charge
                })
    
    elapsed = time.time() - start_time
    print(f"✅ Generated {len(fares)} fare entries in {elapsed:.2f} seconds")
    return fares

def generate_sql_optimized(num_trains=1000):
    """Generate complete SQL with optimization"""
    print("=" * 60)
    print("INDIAN RAILWAYS DATA GENERATOR")
    print("=" * 60)
    
    total_start = time.time()
    
    # Generate data
    trains = generate_trains_fast(num_trains)
    route_stops = generate_route_stops_fast(trains)
    fares = generate_fares_fast(trains)
    
    print("\nGenerating SQL file...")
    sql_start = time.time()
    
    sql_output = []
    
    # 1. Stations SQL
    sql_output.append("-- =========================================")
    sql_output.append("-- INSERT STATIONS")
    sql_output.append("-- =========================================")
    station_values = []
    for station in STATIONS:
        station_values.append(f"('{station[0]}', '{station[1]}', '{station[2]}', '{station[3]}', '{station[4]}', {station[5]}, {station[6]})")
    sql_output.append("INSERT INTO stations (station_code, station_name, city, state, zone, latitude, longitude) VALUES")
    sql_output.append(",\n".join(station_values) + "\nON CONFLICT (station_code) DO NOTHING;")
    sql_output.append("\n")
    
    # 2. Trains SQL - Each train in a single row
    sql_output.append("-- =========================================")
    sql_output.append("-- INSERT TRAINS")
    sql_output.append("-- =========================================")
    
    train_values = []
    for train in trains:
        train_values.append(f"""('{train['train_number']}', '{train['train_name']}', '{train['train_type']}', '{train['zone']}', {str(train['has_pantry']).lower()}, '{train['source_station_code']}', '{train['destination_station_code']}', '{train['departure_time']}', '{train['arrival_time']}', '{train['total_duration']}', {train['total_distance_km']}, {str(train['runs_on_mon']).lower()}, {str(train['runs_on_tue']).lower()}, {str(train['runs_on_wed']).lower()}, {str(train['runs_on_thu']).lower()}, {str(train['runs_on_fri']).lower()}, {str(train['runs_on_sat']).lower()}, {str(train['runs_on_sun']).lower()}, '{train['available_classes']}', {train['total_coaches']})""")
    
    # Split into chunks
    chunk_size = 100
    for i in range(0, len(train_values), chunk_size):
        chunk = train_values[i:i+chunk_size]
        if i > 0:
            sql_output.append(";")
        sql_output.append("INSERT INTO trains (train_number, train_name, train_type, zone, has_pantry, source_station_code, destination_station_code, departure_time, arrival_time, total_duration, total_distance_km, runs_on_mon, runs_on_tue, runs_on_wed, runs_on_thu, runs_on_fri, runs_on_sat, runs_on_sun, available_classes, total_coaches) VALUES")
        sql_output.append(",\n".join(chunk) + "\nON CONFLICT (train_number) DO NOTHING;")
    sql_output.append("\n")
    
    # 3. Route Stops SQL
    sql_output.append("-- =========================================")
    sql_output.append("-- INSERT ROUTE STOPS")
    sql_output.append("-- =========================================")
    
    route_values = []
    for stop in route_stops:
        arrival = f"'{stop['arrival_time']}'" if stop['arrival_time'] else 'NULL'
        departure = f"'{stop['departure_time']}'" if stop['departure_time'] else 'NULL'
        route_values.append(f"""('{stop['train_number']}', '{stop['station_code']}', {stop['stop_sequence']}, {arrival}, {departure}, {stop['halt_minutes']}, {stop['distance_from_source_km']}, {stop['day_number']})""")
    
    chunk_size = 200
    for i in range(0, len(route_values), chunk_size):
        chunk = route_values[i:i+chunk_size]
        if i > 0:
            sql_output.append(";")
        sql_output.append("INSERT INTO route_stops (train_number, station_code, stop_sequence, arrival_time, departure_time, halt_minutes, distance_from_source_km, day_number) VALUES")
        sql_output.append(",\n".join(chunk) + "\nON CONFLICT (train_number, stop_sequence) DO NOTHING;")
    sql_output.append("\n")
    
    # 4. Fares SQL
    sql_output.append("-- =========================================")
    sql_output.append("-- INSERT FARES")
    sql_output.append("-- =========================================")
    
    fare_values = []
    for fare in fares:
        fare_values.append(f"""('{fare['train_number']}', '{fare['class_code']}', {fare['base_fare']}, {fare['tatkal_charge']}, {fare['reservation_charge']})""")
    
    chunk_size = 200
    for i in range(0, len(fare_values), chunk_size):
        chunk = fare_values[i:i+chunk_size]
        if i > 0:
            sql_output.append(";")
        sql_output.append("INSERT INTO train_fares (train_number, class_code, base_fare, tatkal_charge, reservation_charge) VALUES")
        sql_output.append(",\n".join(chunk) + "\nON CONFLICT (train_number, class_code) DO NOTHING;")
    
    # Write to file
    with open('indian_railways_data.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_output))
    
    total_elapsed = time.time() - total_start
    sql_elapsed = time.time() - sql_start
    
    print(f"✅ SQL file generated in {sql_elapsed:.2f} seconds")
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"📊 Total trains: {len(trains)}")
    print(f"📍 Total stops: {len(route_stops)}")
    print(f"💰 Total fares: {len(fares)}")
    print(f"⏱️  Total time: {total_elapsed:.2f} seconds ({total_elapsed/60:.1f} minutes)")
    print(f"📁 Output file: indian_railways_data.sql")
    print("=" * 60)

if __name__ == "__main__":
    generate_sql_optimized(1000)