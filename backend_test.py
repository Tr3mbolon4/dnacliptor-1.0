import requests
import sys
import json
from datetime import datetime

class Logi3AAPITester:
    def __init__(self, base_url="https://logi3a-supply-chain.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_materials = []
        self.created_users = []
        self.created_activities = []

    def run_test(self, name, method, endpoint, expected_status, data=None, check_response=True):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if check_response else {}
                    if response_data:
                        print(f"   Response preview: {str(response_data)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Response text: {response.text[:200]}...")
                
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoints(self):
        """Test basic API endpoints"""
        print("\n📍 Testing Root Endpoints...")
        
        success, response = self.run_test("Root API Version Check", "GET", "", 200)
        if success and 'version' in response:
            if response['version'] == '2.0.0':
                print(f"   ✅ API version correct: {response['version']}")
            else:
                print(f"   ⚠️  Expected version 2.0.0, got {response['version']}")
        
        self.run_test("Health Check", "GET", "health", 200)

    def test_seed_data(self):
        """Test seeding demo data"""
        print("\n🌱 Testing Seed Data...")
        
        success, response = self.run_test("Seed Demo Data", "POST", "seed", 200)
        return success

    def test_usuarios_crud(self):
        """Test user registration and login"""
        print("\n👤 Testing User Management...")
        
        # Test user registration - Aluno
        test_aluno = {
            "nome": "Teste Aluno API",
            "tipo": "aluno",
            "turma": "3º Ano A",
            "matricula": "TEST001",
            "senha": "123456"
        }
        
        success, created_aluno = self.run_test("Register Student", "POST", "usuarios/registro", 201, test_aluno)
        if success and 'id' in created_aluno:
            self.created_users.append(created_aluno['id'])
            print(f"   Created student with ID: {created_aluno['id']}")
            
            # Test login
            login_data = {
                "nome": test_aluno['nome'],
                "senha": test_aluno['senha'],
                "tipo": test_aluno['tipo']
            }
            
            success, login_response = self.run_test("Student Login", "POST", "usuarios/login", 200, login_data)
            if success:
                print(f"   ✅ Student login successful")
        
        # Test professor registration and login
        test_professor = {
            "nome": "Teste Professor API",
            "tipo": "professor",
            "senha": "123456"
        }
        
        success, created_prof = self.run_test("Register Professor", "POST", "usuarios/registro", 201, test_professor)
        if success and 'id' in created_prof:
            self.created_users.append(created_prof['id'])
            
            # Test professor login
            login_data = {
                "nome": test_professor['nome'],
                "senha": test_professor['senha'],
                "tipo": test_professor['tipo']
            }
            
            self.run_test("Professor Login", "POST", "usuarios/login", 200, login_data)
        
        # Test duplicate registration
        duplicate_aluno = {
            "nome": "Teste Aluno API",
            "tipo": "aluno",
            "turma": "3º Ano A",
            "matricula": "TEST001",
            "senha": "123456"
        }
        self.run_test("Duplicate Student Registration", "POST", "usuarios/registro", 400, duplicate_aluno, check_response=False)
        
        # Test invalid login
        invalid_login = {
            "nome": "Invalid User",
            "senha": "wrongpass",
            "tipo": "aluno"
        }
        self.run_test("Invalid Login", "POST", "usuarios/login", 401, invalid_login, check_response=False)

    def test_materiais_crud(self):
        """Test materials CRUD operations"""
        print("\n📦 Testing Materials CRUD...")
        
        # List materials
        success, materials = self.run_test("List Materials", "GET", "materiais", 200)
        if success:
            print(f"   Found {len(materials)} materials")

        # Create new material
        test_material = {
            "nome": "Material de Teste API",
            "codigo": "TESTAPI123456",
            "setor": "Expedição",
            "quantidade": 100,
            "tipo_operacao": "Expedição",
            "descricao": "Material criado para teste automático",
            "localizacao": "Área de Teste"
        }
        
        success, created = self.run_test("Create Material", "POST", "materiais", 201, test_material)
        if success and 'id' in created:
            material_id = created['id']
            self.created_materials.append(material_id)
            print(f"   Created material with ID: {material_id}")
            
            # Get specific material
            self.run_test("Get Material by ID", "GET", f"materiais/{material_id}", 200)
            
            # Get material by code
            self.run_test("Get Material by Code", "GET", f"materiais/codigo/{test_material['codigo']}", 200)
            
            # Update material
            update_data = {
                "nome": "Material de Teste API Atualizado",
                "quantidade": 150
            }
            self.run_test("Update Material", "PUT", f"materiais/{material_id}", 200, update_data)
            
            # Test invalid material ID
            self.run_test("Get Non-existent Material", "GET", "materiais/invalid-id", 404, check_response=False)

    def test_atividades_crud(self):
        """Test activities CRUD operations"""
        print("\n📊 Testing Activities CRUD...")
        
        # List activities
        success, atividades = self.run_test("List Activities", "GET", "atividades", 200)
        if success:
            print(f"   Found {len(atividades)} activities")

        # Create test activity (requires user first)
        if self.created_users:
            test_atividade = {
                "usuario_id": self.created_users[0],
                "codigo_lido": "TESTAPI123456",
                "produto": "Material de Teste API",
                "tipo_leitura": "qrcode",
                "operacao_esperada": "Expedição",
                "operacao_escolhida": "Expedição",
                "tempo_segundos": 30
            }
            
            success, created_atividade = self.run_test("Create Activity", "POST", "atividades", 201, test_atividade)
            if success and 'id' in created_atividade:
                self.created_activities.append(created_atividade['id'])
                print(f"   Created activity with ID: {created_atividade['id']}")
                
                # Test filtering activities
                self.run_test("Filter Activities by User", "GET", f"atividades?usuario_id={self.created_users[0]}", 200)
                self.run_test("Filter Activities by Type", "GET", "atividades?tipo_leitura=qrcode", 200)
        else:
            print("   ⚠️  Skipping activity tests - no users created")

    def test_estatisticas(self):
        """Test statistics endpoint"""
        print("\n📈 Testing Statistics...")
        
        success, stats = self.run_test("Get Statistics", "GET", "estatisticas", 200)
        if success:
            required_fields = [
                'total_leituras', 'leituras_qrcode', 'leituras_barcode',
                'total_materiais', 'total_alunos', 'total_atividades',
                'media_aproveitamento', 'leituras_por_operacao', 'leituras_por_setor',
                'acertos_total', 'erros_total'
            ]
            
            missing_fields = [field for field in required_fields if field not in stats]
            if missing_fields:
                print(f"   ⚠️  Missing fields in stats: {missing_fields}")
            else:
                print(f"   ✅ All required statistics fields present")
                print(f"   Total activities: {stats['total_atividades']}")
                print(f"   Total materials: {stats['total_materiais']}")
                print(f"   Total students: {stats['total_alunos']}")
                print(f"   Average performance: {stats['media_aproveitamento']}%")

    def cleanup(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete created materials
        for material_id in self.created_materials:
            self.run_test(f"Delete Material {material_id}", "DELETE", f"materiais/{material_id}", 200, check_response=False)

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*50}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test.get('error', 'Status code mismatch')}")
        
        return len(self.failed_tests) == 0

def main():
    print("🚀 Starting Logi3A API Testing...")
    print(f"Testing backend at: https://logi3a-supply-chain.preview.emergentagent.com")
    
    tester = Logi3AAPITester()
    
    try:
        # Run all test suites
        tester.test_root_endpoints()
        tester.test_seed_data()
        tester.test_usuarios_crud()
        tester.test_materiais_crud()
        tester.test_atividades_crud()
        tester.test_estatisticas()
        
        # Clean up test data
        tester.cleanup()
        
        # Print summary and return appropriate exit code
        success = tester.print_summary()
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\nUnexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())