DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS route_stops CASCADE;
DROP TABLE IF EXISTS train_fares CASCADE;
DROP TABLE IF EXISTS train_schedule_history CASCADE;
DROP TABLE IF EXISTS trains CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Needed for Auth & Dashboard)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'passenger',
    password_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stations Master Table
CREATE TABLE IF NOT EXISTS stations (
    station_code VARCHAR(10) PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zone VARCHAR(10) NOT NULL,
    platforms INTEGER DEFAULT 1,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    amenities JSONB,
    status VARCHAR(50) DEFAULT 'active',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Train Master Table
CREATE TABLE IF NOT EXISTS trains (
    train_number VARCHAR(10) PRIMARY KEY,
    train_name VARCHAR(100) NOT NULL,
    train_type VARCHAR(50) NOT NULL,
    zone VARCHAR(10),
    has_pantry BOOLEAN DEFAULT FALSE,
    source_station_code VARCHAR(10) REFERENCES stations(station_code),
    destination_station_code VARCHAR(10) REFERENCES stations(station_code),
    departure_time VARCHAR(20) NOT NULL,
    arrival_time VARCHAR(20) NOT NULL,
    total_duration INTERVAL,
    total_distance_km INTEGER,
    runs_on_mon BOOLEAN DEFAULT TRUE,
    runs_on_tue BOOLEAN DEFAULT TRUE,
    runs_on_wed BOOLEAN DEFAULT TRUE,
    runs_on_thu BOOLEAN DEFAULT TRUE,
    runs_on_fri BOOLEAN DEFAULT TRUE,
    runs_on_sat BOOLEAN DEFAULT TRUE,
    runs_on_sun BOOLEAN DEFAULT TRUE,
    available_classes JSONB,
    total_coaches INTEGER,
    status VARCHAR(50) DEFAULT 'On Time',
    delay_minutes INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Route Stops Table
CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(10) REFERENCES trains(train_number),
    station_code VARCHAR(10) REFERENCES stations(station_code),
    stop_sequence INTEGER NOT NULL,
    arrival_time VARCHAR(20),
    departure_time VARCHAR(20),
    halt_minutes INTEGER DEFAULT 0,
    distance_from_source_km INTEGER DEFAULT 0,
    day_number INTEGER DEFAULT 1,
    platform_number INTEGER,
    UNIQUE(train_number, stop_sequence),
    UNIQUE(train_number, station_code)
);

-- 5. Bookings Table (Needed for UI)
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    pnr VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(id),
    train_number VARCHAR(10) REFERENCES trains(train_number),
    from_station_code VARCHAR(10) REFERENCES stations(station_code),
    to_station_code VARCHAR(10) REFERENCES stations(station_code),
    journey_date DATE NOT NULL,
    travel_class VARCHAR(10),
    total_fare DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audit Logs Table (Needed for Admin Dashboard)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    type VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    channel VARCHAR(50),
    priority VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- 8. Train Fare Table
CREATE TABLE IF NOT EXISTS train_fares (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(10) REFERENCES trains(train_number),
    class_code VARCHAR(5) NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL,
    tatkal_charge DECIMAL(10, 2),
    reservation_charge DECIMAL(10, 2),
    UNIQUE(train_number, class_code)
);

-- 9. Train Schedule History
CREATE TABLE IF NOT EXISTS train_schedule_history (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(10) REFERENCES trains(train_number),
    schedule_date DATE NOT NULL,
    actual_departure VARCHAR(20),
    actual_arrival VARCHAR(20),
    status VARCHAR(20) DEFAULT 'On Time',
    delay_minutes INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_route_stops_train ON route_stops(train_number);
CREATE INDEX IF NOT EXISTS idx_route_stops_station ON route_stops(station_code);
CREATE INDEX IF NOT EXISTS idx_trains_source ON trains(source_station_code);
CREATE INDEX IF NOT EXISTS idx_trains_dest ON trains(destination_station_code);
