-- Begin by creating the database and switching to it
DROP DATABASE IF EXISTS UsedcarDatabase;
CREATE DATABASE IF NOT EXISTS `UsedcarDatabase` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `UsedcarDatabase`;

-- Creating the User table
CREATE TABLE User (
  userID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username varchar(50) NOT NULL UNIQUE,
  password varchar(500) NOT NULL ,
  fName VARCHAR(50) ,
  lName VARCHAR(50) ,
  email VARCHAR(100) NOT NULL,
  city VARCHAR(50) ,
  province VARCHAR(50) ,
  zipcode VARCHAR(20) ,
  phonenum VARCHAR(20) ,
  registerationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(50) DEFAULT "Customer"
);

-- Creating the Review table
CREATE TABLE Review (
  reviewID INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
  rating INT ,
  reviewText TEXT,
  reviewDate DATE NOT NULL,
  userID INT NOT NULL
)AUTO_INCREMENT = 20000;


-- Creating the Car table (must be created before the Insurance table)
CREATE TABLE Car (
  carid INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  cartype varchar(50),
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  mileage INT NOT NULL,
  year int ,
  description TEXT,
  carcondition varchar(50),
  fuel VARCHAR(50),
  insurance int,
  price INT NOT NULL,
  image varchar(255)
  -- link foreign key cert id verified
);


CREATE TABLE CertifiedUsedCar (
  certID INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
  numberofCars INT NOT NULL,
  verified enum('Yes','No') default 'No' ,
  carid INT NOT NULL
);

-- Creating the Insurance table
CREATE TABLE Insurance (
  policyNumber INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
  providerName VARCHAR(50) NOT NULL,
  expdate DATE NOT NULL,
  coverageDetail VARCHAR(300),
  userID INT NOT NULL,
  carid INT NOT NULL
)AUTO_INCREMENT = 410000;



-- Creating the Seller table
CREATE TABLE Seller (
  sellerID INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
  numberofCars INT ,
  verified VARCHAR(50) NOT NULL,
  rating INT ,
  city VARCHAR(50) ,
  province VARCHAR(50) ,
  zipcode VARCHAR(20) ,
  contactinfo VARCHAR(150) ,
  dealershipID INT ,
  adID INT ,
  carid INT
)AUTO_INCREMENT = 60000;

-- Creating the Dealership table
CREATE TABLE Dealership (
  dealershipID INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
  dealerName VARCHAR(50) NOT NULL,
  numCar INT NOT NULL,
  sellerID INT NOT NULL

)AUTO_INCREMENT = 710000;

-- Creating the Advertisement table
CREATE TABLE Advertisement (
  adID INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
  title VARCHAR(100) NOT NULL,
  cost INT NOT NULL,
  expdate DATE NOT NULL,
  adDescription TEXT,
  sellerID VARCHAR(50) NOT NULL

)AUTO_INCREMENT = 810000;
-- order foreignkey

-- ALTER TABLE Review
-- ADD FOREIGN KEY (UserID) REFERENCES User(UserID);

-- ALTER TABLE Dealership
-- ADD FOREIGN KEY (SellerID) REFERENCES Seller(SellerID);

-- ALTER TABLE Insurance
-- ADD FOREIGN KEY (UserID) REFERENCES User(UserID),
-- ADD FOREIGN KEY (CarID) REFERENCES Car(CarID);

-- ALTER TABLE Dealership
-- ADD FOREIGN KEY (SellerID) REFERENCES Seller(SellerID);

-- ALTER TABLE CertifiedUsedCar
-- ADD FOREIGN KEY (CarID) REFERENCES Car(CarID);



-- ALTER TABLE Seller
-- ADD FOREIGN KEY (CARID) REFERENCES Car(CarID);



-- Sample data insertion for User table
INSERT INTO User (Username,Password,FName, LName, Email, City, Province, Zipcode, Phonenum, role) VALUES
('Johnny169','secret','John', 'Doe', 'john.doe@example.com', 'New York', 'NY', '10001', '1234567890', 'Admin'),
('Morissey542','girlq1','Jane', 'Smith', 'jane.smith@example.com', 'Los Angeles', 'CA', '90001', '0987654321', 'User'),
('admin','password','aa', 'aa', 'admin@example.com', 'Los Angeles', 'CA', '90001', '0987654321', 'Admin');


-- Sample data for Car table
INSERT INTO Car (Price, Model, Mileage, Brand,  Description, Fuel ) VALUES
(20000, 'Model S', 15000, 'Tesla',  'High performance', 'Electric' ),
(15000, 'Corolla', 30000, 'Toyota',  'Reliable and efficient', 'Gasoline');

-- Sample data insertion for Insurance table (ensure correct UserID and CarID)
INSERT INTO Insurance ( ProviderName, Expdate, CoverageDetail, UserID, CarID) VALUES
( 'Allstate', '2025-05-20', 'Full coverage', 1, '1'),  -- UserID 1 corresponds to John Doe
( 'Geico', '2025-07-15', 'Basic coverage', 2, '2');  -- UserID 2 corresponds to Jane Smith

-- Sample data for CertifiedUsedCar table
INSERT INTO CertifiedUsedCar (NumberofCars, Verified, CarID) VALUES
( 5, 'Yes', '1'),
( 3, 'Yes', '2');

-- Sample data for Seller table
INSERT INTO Seller ( NumberofCars, Verified, Rating, City, Province, Zipcode, Contactinfo,CarID) VALUES
( 10, 'Yes', 5, 'Miami', 'FL', '33101', 'seller1@example.com', '1'),
( 8, 'Yes', 4, 'Houston', 'TX', '77001', 'seller2@example.com','2');

-- Sample data for Dealership table
INSERT INTO Dealership ( DealerName, NumCar, SellerID) VALUES
( 'AutoMax', 50, 60000),
( 'CarWorld', 40, 60001);

-- Sample data for Advertisement table
INSERT INTO Advertisement ( Title, Cost, Expdate, AdDescription, SellerID) VALUES
( 'Tesla for Sale', 100, '2024-12-31', 'Great condition',  60000),
( 'Toyota for Sale', 80, '2024-11-30', 'Low mileage', 60001);


ALTER TABLE User
MODIFY COLUMN UserID INT AUTO_INCREMENT;







