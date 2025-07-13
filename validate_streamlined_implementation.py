#!/usr/bin/env python3
"""
Streamlined Implementation Validation Script
Validates that all critical components are working correctly after cleanup.
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class StreamlinedValidator:
    """Validates the streamlined implementation."""
    
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "phase_1_cors": {"status": "pending", "details": []},
            "phase_2_openai": {"status": "pending", "details": []},
            "phase_3_frontend": {"status": "pending", "details": []},
            "phase_4_backend": {"status": "pending", "details": []},
            "phase_5_cleanup": {"status": "pending", "details": []},
            "overall_status": "pending"
        }
    
    async def validate_phase_1_cors(self):
        """Validate CORS and middleware cleanup."""
        logger.info("🔍 Phase 1: Validating CORS & Middleware Cleanup")
        
        try:
            # Check that duplicate CORS file is removed
            cors_file = project_root / "backend" / "middleware" / "cors.py"
            if cors_file.exists():
                self.results["phase_1_cors"]["details"].append("❌ Duplicate cors.py still exists")
                return False
            else:
                self.results["phase_1_cors"]["details"].append("✅ Duplicate cors.py successfully removed")
            
            # Check that auth_security.py exists and contains CORS
            auth_security_file = project_root / "backend" / "middleware" / "auth_security.py"
            if not auth_security_file.exists():
                self.results["phase_1_cors"]["details"].append("❌ auth_security.py missing")
                return False
            
            # Read and validate auth_security.py contains CORS functionality
            with open(auth_security_file, 'r') as f:
                content = f.read()
                if "CORS" in content and "Access-Control-Allow-Origin" in content:
                    self.results["phase_1_cors"]["details"].append("✅ CORS functionality in auth_security.py")
                else:
                    self.results["phase_1_cors"]["details"].append("❌ CORS functionality missing from auth_security.py")
                    return False
            
            # Check render.yaml CORS configuration
            render_file = project_root / "render.yaml"
            if render_file.exists():
                with open(render_file, 'r') as f:
                    content = f.read()
                    if "CORS_ORIGINS" in content and "hocomnia.com" in content:
                        self.results["phase_1_cors"]["details"].append("✅ Production CORS origins configured in render.yaml")
                    else:
                        self.results["phase_1_cors"]["details"].append("⚠️ CORS origins may need update in render.yaml")
            
            self.results["phase_1_cors"]["status"] = "passed"
            return True
            
        except Exception as e:
            self.results["phase_1_cors"]["details"].append(f"❌ Error: {str(e)}")
            self.results["phase_1_cors"]["status"] = "failed"
            return False
    
    async def validate_phase_2_openai(self):
        """Validate OpenAI integration."""
        logger.info("🤖 Phase 2: Validating OpenAI Integration")
        
        try:
            # Check OpenAI service exists
            openai_service_file = project_root / "backend" / "services" / "openai_service.py"
            if not openai_service_file.exists():
                self.results["phase_2_openai"]["details"].append("❌ openai_service.py missing")
                return False
            else:
                self.results["phase_2_openai"]["details"].append("✅ OpenAI service file exists")
            
            # Check OpenAI routes exist
            openai_routes_file = project_root / "backend" / "routes" / "openai_routes.py"
            if not openai_routes_file.exists():
                self.results["phase_2_openai"]["details"].append("❌ openai_routes.py missing")
                return False
            else:
                self.results["phase_2_openai"]["details"].append("✅ OpenAI routes file exists")
            
            # Try to import OpenAI service
            try:
                from backend.services.openai_service import openai_service
                self.results["phase_2_openai"]["details"].append("✅ OpenAI service imports successfully")
                
                # Check if service is configured
                if hasattr(openai_service, 'is_available'):
                    is_available = openai_service.is_available
                    if is_available:
                        self.results["phase_2_openai"]["details"].append("✅ OpenAI service available and configured")
                    else:
                        self.results["phase_2_openai"]["details"].append("⚠️ OpenAI service exists but API key not configured")
                
            except Exception as e:
                self.results["phase_2_openai"]["details"].append(f"❌ OpenAI service import failed: {str(e)}")
                return False
            
            self.results["phase_2_openai"]["status"] = "passed"
            return True
            
        except Exception as e:
            self.results["phase_2_openai"]["details"].append(f"❌ Error: {str(e)}")
            self.results["phase_2_openai"]["status"] = "failed"
            return False
    
    async def validate_phase_3_frontend(self):
        """Validate frontend functionality."""
        logger.info("🖥️ Phase 3: Validating Frontend Integration")
        
        try:
            # Check key frontend files exist
            frontend_files = [
                "frontend/src/services/api.js",
                "frontend/src/pages/EnhancedHome.js",
                "frontend/src/pages/Dashboard.js",
                "frontend/src/pages/EnhancedNeoDecoLanding.js"
            ]
            
            for file_path in frontend_files:
                full_path = project_root / file_path
                if full_path.exists():
                    self.results["phase_3_frontend"]["details"].append(f"✅ {file_path} exists")
                else:
                    self.results["phase_3_frontend"]["details"].append(f"❌ {file_path} missing")
                    return False
            
            # Check if OpenAI API endpoints are in frontend
            api_file = project_root / "frontend" / "src" / "services" / "api.js"
            with open(api_file, 'r') as f:
                content = f.read()
                if "openaiApi" in content:
                    self.results["phase_3_frontend"]["details"].append("✅ OpenAI API endpoints integrated in frontend")
                else:
                    self.results["phase_3_frontend"]["details"].append("❌ OpenAI API endpoints missing from frontend")
                    return False
                
                if "dashboardApi" in content:
                    self.results["phase_3_frontend"]["details"].append("✅ Dashboard API endpoints integrated in frontend")
                else:
                    self.results["phase_3_frontend"]["details"].append("❌ Dashboard API endpoints missing from frontend")
                    return False
            
            # Check package.json exists
            package_json = project_root / "frontend" / "package.json"
            if package_json.exists():
                self.results["phase_3_frontend"]["details"].append("✅ Frontend package.json exists")
            else:
                self.results["phase_3_frontend"]["details"].append("❌ Frontend package.json missing")
                return False
            
            self.results["phase_3_frontend"]["status"] = "passed"
            return True
            
        except Exception as e:
            self.results["phase_3_frontend"]["details"].append(f"❌ Error: {str(e)}")
            self.results["phase_3_frontend"]["status"] = "failed"
            return False
    
    async def validate_phase_4_backend(self):
        """Validate backend API completeness."""
        logger.info("🏗️ Phase 4: Validating Backend API Completeness")
        
        try:
            # Check essential backend files
            backend_files = [
                "backend/server.py",
                "backend/routes/auth.py",
                "backend/routes/documents.py",
                "backend/routes/inventory.py",
                "backend/routes/dashboard_routes.py",
                "backend/routes/openai_routes.py",
                "backend/config/security.py",
                "backend/middleware/auth_security.py"
            ]
            
            for file_path in backend_files:
                full_path = project_root / file_path
                if full_path.exists():
                    self.results["phase_4_backend"]["details"].append(f"✅ {file_path} exists")
                else:
                    self.results["phase_4_backend"]["details"].append(f"❌ {file_path} missing")
                    return False
            
            # Check server.py imports auth_security correctly
            server_file = project_root / "backend" / "server.py"
            with open(server_file, 'r') as f:
                content = f.read()
                if "from backend.middleware.auth_security import setup_auth_security" in content:
                    self.results["phase_4_backend"]["details"].append("✅ Server uses consolidated auth_security middleware")
                else:
                    self.results["phase_4_backend"]["details"].append("❌ Server not using consolidated auth_security middleware")
                    return False
            
            # Check database schema files
            schema_files = [
                "backend/scripts/init.sql",
                "backend/scripts/init_metadata_db.sql"
            ]
            
            for file_path in schema_files:
                full_path = project_root / file_path
                if full_path.exists():
                    self.results["phase_4_backend"]["details"].append(f"✅ {file_path} exists")
                else:
                    self.results["phase_4_backend"]["details"].append(f"⚠️ {file_path} missing")
            
            self.results["phase_4_backend"]["status"] = "passed"
            return True
            
        except Exception as e:
            self.results["phase_4_backend"]["details"].append(f"❌ Error: {str(e)}")
            self.results["phase_4_backend"]["status"] = "failed"
            return False
    
    async def validate_phase_5_cleanup(self):
        """Validate cleanup completion."""
        logger.info("🧹 Phase 5: Validating Cleanup Completion")
        
        try:
            # Check that redundant files are removed
            redundant_files = [
                "backend/middleware/cors.py",
                "backend/middleware/setup.py",
                "backend/tests/recode",
                "frontend/test-import.js"
            ]
            
            cleanup_successful = True
            for file_path in redundant_files:
                full_path = project_root / file_path
                if full_path.exists():
                    self.results["phase_5_cleanup"]["details"].append(f"❌ Redundant file still exists: {file_path}")
                    cleanup_successful = False
                else:
                    self.results["phase_5_cleanup"]["details"].append(f"✅ Redundant file removed: {file_path}")
            
            # Check that essential files are preserved
            essential_files = [
                "backend/middleware/auth_security.py",
                "backend/middleware/error_handlers.py",
                "backend/middleware/request_logger.py"
            ]
            
            for file_path in essential_files:
                full_path = project_root / file_path
                if full_path.exists():
                    self.results["phase_5_cleanup"]["details"].append(f"✅ Essential file preserved: {file_path}")
                else:
                    self.results["phase_5_cleanup"]["details"].append(f"❌ Essential file missing: {file_path}")
                    cleanup_successful = False
            
            if cleanup_successful:
                self.results["phase_5_cleanup"]["status"] = "passed"
                return True
            else:
                self.results["phase_5_cleanup"]["status"] = "failed"
                return False
            
        except Exception as e:
            self.results["phase_5_cleanup"]["details"].append(f"❌ Error: {str(e)}")
            self.results["phase_5_cleanup"]["status"] = "failed"
            return False
    
    async def run_validation(self):
        """Run complete validation suite."""
        logger.info("🚀 Starting Streamlined Implementation Validation")
        
        phases = [
            ("phase_1_cors", self.validate_phase_1_cors),
            ("phase_2_openai", self.validate_phase_2_openai),
            ("phase_3_frontend", self.validate_phase_3_frontend),
            ("phase_4_backend", self.validate_phase_4_backend),
            ("phase_5_cleanup", self.validate_phase_5_cleanup)
        ]
        
        all_passed = True
        
        for phase_name, phase_func in phases:
            try:
                result = await phase_func()
                if not result:
                    all_passed = False
            except Exception as e:
                logger.error(f"❌ Phase {phase_name} failed with exception: {str(e)}")
                self.results[phase_name]["status"] = "failed"
                self.results[phase_name]["details"].append(f"❌ Exception: {str(e)}")
                all_passed = False
        
        # Set overall status
        if all_passed:
            self.results["overall_status"] = "passed"
            logger.info("✅ All validation phases passed!")
        else:
            self.results["overall_status"] = "failed"
            logger.error("❌ One or more validation phases failed")
        
        return self.results
    
    def generate_report(self):
        """Generate validation report."""
        report = []
        report.append("=" * 80)
        report.append("🏛️ STREAMLINED BARTLEBY IMPLEMENTATION VALIDATION REPORT")
        report.append("=" * 80)
        report.append(f"Validation Time: {self.results['timestamp']}")
        report.append(f"Overall Status: {self.results['overall_status'].upper()}")
        report.append("")
        
        for phase_key, phase_data in self.results.items():
            if phase_key in ["timestamp", "overall_status"]:
                continue
            
            phase_name = phase_key.replace("_", " ").title()
            status = phase_data["status"].upper()
            report.append(f"📋 {phase_name}: {status}")
            
            for detail in phase_data["details"]:
                report.append(f"   {detail}")
            report.append("")
        
        report.append("=" * 80)
        
        if self.results["overall_status"] == "passed":
            report.append("🎉 VALIDATION COMPLETE - SYSTEM READY FOR DEPLOYMENT!")
        else:
            report.append("⚠️ VALIDATION ISSUES FOUND - REVIEW FAILED ITEMS ABOVE")
        
        report.append("=" * 80)
        
        return "\n".join(report)


async def main():
    """Main validation entry point."""
    validator = StreamlinedValidator()
    
    try:
        results = await validator.run_validation()
        report = validator.generate_report()
        
        # Print report to console
        print(report)
        
        # Save report to file
        report_file = project_root / "STREAMLINED_VALIDATION_REPORT.md"
        with open(report_file, 'w') as f:
            f.write(f"# Streamlined Implementation Validation Report\n\n")
            f.write(f"Generated: {results['timestamp']}\n\n")
            f.write("```\n")
            f.write(report)
            f.write("\n```\n")
        
        logger.info(f"📄 Validation report saved to: {report_file}")
        
        # Exit with appropriate code
        if results["overall_status"] == "passed":
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Validation failed with exception: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
