CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL
);


INSERT INTO users (name, email)
VALUES
    ('Mattias', 'mattias@test.se'),
    ('Test User', 'test@test.se');

INSERT INTO movies (title, description, duration_minutes)
VALUES
    ('Interstellar', 'A science fiction movie about space and time.', 169),
    ('The Batman', 'A dark superhero movie.', 176);