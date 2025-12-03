#!/bin/bash
echo "📊 Configurando base de datos MySQL..."
echo "Por favor ingresa la contraseña de MySQL cuando se solicite"

mysql -u root -p < schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de datos configurada exitosamente"
    echo "📁 Base de datos: onboarding_db"
    echo "📋 Tablas creadas: collaborators, technical_onboarding_calendar"
    echo "📝 Datos de ejemplo insertados"
else
    echo "❌ Error configurando la base de datos"
fi
