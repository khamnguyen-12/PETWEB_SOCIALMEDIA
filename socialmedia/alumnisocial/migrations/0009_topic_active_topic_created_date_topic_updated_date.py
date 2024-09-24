# Generated by Django 5.0.6 on 2024-09-23 15:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('alumnisocial', '0008_category_active_category_created_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='topic',
            name='created_date',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='topic',
            name='updated_date',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
    ]
