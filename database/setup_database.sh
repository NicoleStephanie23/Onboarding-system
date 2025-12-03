#!/bin/bash
echo "📊 Configurando base de datos MySQL..."
echo ""

if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL no está instalado"
    echo "Instala MySQL con: brew install mysql"
    exit 1
fi

if ! mysqladmin -u root -p ping 2>/dev/null | grep -q "mysqld is alive"; then
    echo "⚠️  MySQL no está corriendo"
    echo "Inicia MySQL con: brew services start mysql"
    echo "O con: mysql.server start"
    echo ""
    read -p "¿Quieres intentar iniciar MySQL ahora? (s/n): " start_mysql
    if [[ $start_mysql == "s" || $start_mysql == "S" ]]; then
        brew services start mysql 2>/dev/null || mysql.server start
        sleep 3
    fi
fi

echo "🔑 Si configuraste contraseña para MySQL, ingrésala ahora."
echo "   Si NO tienes contraseña, solo presiona Enter."
echo ""

echo "🔍 Probando conexión a MySQL..."
if mysql -u root -e "SELECT 1" 2>/dev/null; then
    echo "✅ Conectado a MySQL sin contraseña"
    PASSWORD_OPTION=""
else
    echo "🔐 Se requiere contraseña"
    echo -n "Ingresa la contraseña de MySQL (root): "
    read -s MYSQL_PASSWORD
    echo ""
    PASSWORD_OPTION="-p$MYSQL_PASSWORD"
fi

echo "🗃️  Creando base de datos y tablas..."
if mysql -u root $PASSWORD_OPTION < schema.sql 2>/dev/null; then
    echo "✅ Base de datos configurada exitosamente"
    echo ""
    echo "📋 RESUMEN:"
    echo "   📁 Base de datos: onboarding_db"
    echo "   📊 Tablas: collaborators, technical_onboarding_calendar"
    echo "   👥 Datos de ejemplo: 5 colaboradores"
    echo "   📅 Datos de ejemplo: 4 eventos de calendario"
    echo ""
    echo "🔍 Para verificar, ejecuta:"
    echo "   mysql -u root $PASSWORD_OPTION -e \"USE onboarding_db; SHOW TABLES;\""
else
    echo "❌ Error configurando la base de datos"
    echo ""
    echo "🛠️  Soluciones posibles:"
    echo "1. Verifica que MySQL esté corriendo: brew services list | grep mysql"
    echo "2. Intenta crear la base de datos manualmente:"
    echo "   mysql -u root $PASSWORD_OPTION"
    echo "   Luego ejecuta: CREATE DATABASE onboarding_db;"
    echo "3. Verifica el archivo schema.sql: cat schema.sql"
fi
