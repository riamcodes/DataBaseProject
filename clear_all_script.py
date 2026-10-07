import mysql.connector

# Database connection
connection = mysql.connector.connect(
    host="localhost",
    user="cs5330",
    password="pw5330",
    database="db_project"
)

cursor = connection.cursor()

# Clear all data from every table in the database
def clear_all():
    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()

        for (table_name,) in tables:
            try:
                cursor.execute(f"TRUNCATE TABLE {table_name};")
                print(f"Table '{table_name}' cleared.")
            except Exception as e:
                print(f"Failed to clear table '{table_name}': {e}")

        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        connection.commit()
        print("All tables have been cleared.")
    except Exception as e:
        print(f"Error clearing tables: {e}")

try:
    clear_all()
except Exception as e:
    print("Error:", e)
finally:
    cursor.close()
    connection.close()
