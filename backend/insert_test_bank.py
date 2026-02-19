#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SanpurnamEngine.settings')
django.setup()

from backend.models import Bankdetails
from django.utils import timezone

# Create a test bank if it doesn't exist
bank, created = Bankdetails.objects.get_or_create(
    bank_code='BANK001',
    defaults={
        'bank_name': 'Test Bank',
        'createdon': timezone.now(),
        'updatedon': timezone.now(),
        'createdby': 1,
        'updatedby': 1
    }
)

if created:
    print(f"✓ Test bank created: {bank.bank_code} - {bank.bank_name}")
else:
    print(f"✓ Test bank already exists: {bank.bank_code} - {bank.bank_name}")

# List all banks
all_banks = Bankdetails.objects.all()
print(f"\nTotal banks in DB: {all_banks.count()}")
for b in all_banks:
    print(f"  - {b.bank_code}: {b.bank_name}")
