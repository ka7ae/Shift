# Generated by Django 5.0.7 on 2024-07-16 09:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shift',
            name='shift_type',
            field=models.CharField(choices=[('Lunch', 'Lunch'), ('Dinner', 'Dinner'), ('Or', 'Or'), ('Full', 'Full')], max_length=10),
        ),
    ]