"""
Backend API tests for Logi3A Soluções - Testing iteration 3
Focus: Leituras CRUD endpoints and image upload functionality
"""
import pytest
import requests
import os
import io

# Use the public URL from frontend environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://logi3a-supply-chain.preview.emergentagent.com').rstrip('/')


class TestHealthEndpoints:
    """Basic health and API version checks"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ Health check passed: {data}")

    def test_api_root(self):
        """Test API root returns version info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        print(f"✓ API root: {data}")


class TestLeiturasEndpoints:
    """Tests for /api/leituras CRUD operations"""
    
    def test_create_leitura(self):
        """Test POST /api/leituras - creates a scan record"""
        payload = {
            "codigo": "TEST_789456123",
            "produto": "Test Produto Leitura",
            "tipo_leitura": "qrcode",
            "tipo_operacao": "Recebimento",
            "setor": "Estoque A",
            "quantidade": 10,
            "aluno": "TEST_Aluno",
            "turma": "TEST_Turma1",
            "pontuacao": 50
        }
        response = requests.post(f"{BASE_URL}/api/leituras", json=payload)
        
        # Should return 201 for create
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["codigo"] == payload["codigo"]
        assert data["produto"] == payload["produto"]
        assert data["tipo_leitura"] == payload["tipo_leitura"]
        assert data["tipo_operacao"] == payload["tipo_operacao"]
        assert data["setor"] == payload["setor"]
        assert data["quantidade"] == payload["quantidade"]
        assert data["aluno"] == payload["aluno"]
        assert data["turma"] == payload["turma"]
        assert data["pontuacao"] == payload["pontuacao"]
        assert "id" in data
        assert "timestamp" in data
        print(f"✓ Leitura created: {data['id']}")
        return data

    def test_get_leituras_list(self):
        """Test GET /api/leituras - returns list of scan records"""
        response = requests.get(f"{BASE_URL}/api/leituras")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET leituras returned {len(data)} records")
        
        # If we have records, verify structure
        if len(data) > 0:
            record = data[0]
            assert "id" in record
            assert "codigo" in record
            assert "produto" in record
            assert "tipo_leitura" in record
            assert "timestamp" in record
            print(f"✓ Leitura record structure verified")

    def test_get_leituras_with_filter(self):
        """Test GET /api/leituras with filters"""
        # Filter by tipo_leitura
        response = requests.get(f"{BASE_URL}/api/leituras?tipo_leitura=qrcode")
        assert response.status_code == 200
        data = response.json()
        # All returned records should be qrcode type
        for record in data:
            if record.get("tipo_leitura"):
                assert record["tipo_leitura"] == "qrcode", f"Expected qrcode, got {record['tipo_leitura']}"
        print(f"✓ Filtered by tipo_leitura=qrcode: {len(data)} records")

    def test_delete_all_leituras(self):
        """Test DELETE /api/leituras - clears all records"""
        # First create a test record
        payload = {
            "codigo": "TEST_DELETABLE_123",
            "produto": "Test Produto Delete",
            "tipo_leitura": "barcode",
            "tipo_operacao": "Expedição",
            "setor": "Expedição",
            "quantidade": 1
        }
        create_response = requests.post(f"{BASE_URL}/api/leituras", json=payload)
        assert create_response.status_code == 201
        
        # Now delete all
        delete_response = requests.delete(f"{BASE_URL}/api/leituras")
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert "message" in data
        print(f"✓ Delete response: {data}")
        
        # Verify deletion by fetching again
        get_response = requests.get(f"{BASE_URL}/api/leituras")
        assert get_response.status_code == 200
        records = get_response.json()
        assert len(records) == 0, f"Expected 0 records after delete, got {len(records)}"
        print(f"✓ All leituras deleted successfully")


class TestImageUploadEndpoint:
    """Tests for /api/upload-image endpoint"""
    
    def test_upload_image_png(self):
        """Test POST /api/upload-image accepts PNG file"""
        # Create a minimal 1x1 PNG image
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk header
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1 dimensions
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # bit depth, color type, etc
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,  # IEND chunk
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {
            'file': ('test_image.png', io.BytesIO(png_data), 'image/png')
        }
        
        response = requests.post(f"{BASE_URL}/api/upload-image", files=files)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        assert "url" in data
        assert "filename" in data
        assert data["url"].startswith("/api/images/")
        print(f"✓ PNG uploaded successfully: {data}")
        return data

    def test_upload_image_jpeg(self):
        """Test POST /api/upload-image accepts JPEG file"""
        # Minimal JPEG header
        jpeg_data = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
            0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
            0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
            0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
            0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
            0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
            0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
            0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
            0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
            0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
            0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
            0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4,
            0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
            0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
            0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF,
            0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
            0x00, 0x7F, 0xFF, 0xD9
        ])
        
        files = {
            'file': ('test_image.jpg', io.BytesIO(jpeg_data), 'image/jpeg')
        }
        
        response = requests.post(f"{BASE_URL}/api/upload-image", files=files)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data
        print(f"✓ JPEG uploaded successfully: {data}")

    def test_upload_invalid_file_type(self):
        """Test POST /api/upload-image rejects unsupported file types"""
        # Send a text file as if it were an image
        files = {
            'file': ('test.txt', io.BytesIO(b'This is not an image'), 'text/plain')
        }
        
        response = requests.post(f"{BASE_URL}/api/upload-image", files=files)
        
        # Should be rejected
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid file type rejected correctly: {data['detail']}")


class TestMateriais:
    """Quick check on materials API"""
    
    def test_get_materiais(self):
        """Test GET /api/materiais returns list"""
        response = requests.get(f"{BASE_URL}/api/materiais")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Materials count: {len(data)}")


class TestSeedData:
    """Test seeding functionality"""
    
    def test_seed_endpoint(self):
        """Test POST /api/seed creates demo data"""
        response = requests.post(f"{BASE_URL}/api/seed")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Seed response: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
