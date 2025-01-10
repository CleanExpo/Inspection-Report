import { jobManagementService } from '../services/jobManagementService';
import { moistureManagementService } from '../services/moistureManagementService';
import { equipmentTrackingService } from '../services/equipmentTrackingService';
import { documentationService } from '../services/documentationService';
import { areaMappingService } from '../services/areaMappingService';
import { visualizationService } from '../services/visualizationService';
import { sketchService } from '../services/sketchService';
import { reportGenerationService } from '../services/reportGenerationService';
import { lidarService } from '../services/lidarService';
import { propertyPlanService } from '../services/propertyPlanService';
import { interactiveDocumentationService } from '../services/interactiveDocumentationService';
import { safetyService } from '../services/safetyService';
import { claimTypeService } from '../services/claimTypeService';
import { sdsService } from '../services/sdsService';

describe('Complete Job Workflow Test', () => {
    let jobId: string;

    beforeEach(() => {
        // Clear all services
        jobManagementService.clearRecords();
        moistureManagementService.clearReadings();
        equipmentTrackingService.clearRecords();
        documentationService.clearRecords();
    });

    test('1. Create New Job', () => {
        const job = jobManagementService.createJob({
            clientInfo: {
                name: 'John Smith',
                address: '123 Test Street, Brisbane QLD 4000',
                phone: '0400 123 456',
                email: 'john.smith@example.com',
                insurance: {
                    company: 'Test Insurance Co',
                    policyNumber: 'POL123456',
                    claimNumber: 'CLM789012'
                }
            },
            incidentDetails: {
                dateOfLoss: '2024-01-15',
                type: 'Water Damage',
                source: 'Burst pipe in upstairs bathroom',
                affectedAreas: [
                    'Upstairs bathroom',
                    'Upstairs hallway',
                    'Living room ceiling',
                    'Living room walls',
                    'Living room floor'
                ]
            },
            assignedTechnician: 'Tech001'
        });

        expect(job.jobId).toBeDefined();
        jobId = job.jobId;
        expect(job.status).toBe('new');
    });

    test('2. Create Initial Inspection Report', () => {
        const inspection = jobManagementService.createInspectionReport({
            jobId,
            technician: 'Tech001',
            propertyCondition: {
                exterior: {
                    damage: false,
                    notes: ['No visible external damage']
                },
                interior: {
                    damage: true,
                    notes: ['Water damage visible on ceiling', 'Wet carpet in affected areas']
                },
                hazards: ['Slip hazard on wet floors']
            },
            affectedAreas: [
                {
                    area: 'Upstairs Bathroom',
                    damage: ['Water damage on floor', 'Wet walls'],
                    readings: {
                        moisture: 85,
                        humidity: 75,
                        temperature: 23
                    },
                    recommendations: ['Install air movers', 'Install dehumidifier']
                },
                {
                    area: 'Living Room',
                    damage: ['Water damage on ceiling', 'Wet walls'],
                    readings: {
                        moisture: 95,
                        humidity: 78,
                        temperature: 22
                    },
                    recommendations: ['Install air movers', 'Monitor ceiling integrity']
                }
            ],
            photos: [
                {
                    id: 'photo1',
                    type: 'damage',
                    location: 'Upstairs Bathroom Floor'
                },
                {
                    id: 'photo2',
                    type: 'moisture_reading',
                    location: 'Living Room Ceiling'
                }
            ],
            equipment: [
                {
                    type: 'Air Mover',
                    count: 4,
                    location: 'Distributed in affected areas'
                },
                {
                    type: 'Dehumidifier',
                    count: 2,
                    location: 'One upstairs, one in living room'
                }
            ],
            recommendations: [
                'Monitor moisture levels daily',
                'Check ceiling structure integrity',
                'Consider containment in affected areas'
            ],
            technicianSignature: 'Tech001'
        });

        expect(inspection.date).toBeDefined();
        expect(inspection.affectedAreas).toHaveLength(2);
    });

    test('3. Create Scope of Work', () => {
        const scope = jobManagementService.createScopeOfWork({
            jobId,
            tasks: [
                {
                    area: 'Upstairs Bathroom',
                    description: 'Install drying equipment and monitor moisture levels',
                    status: 'pending'
                },
                {
                    area: 'Living Room',
                    description: 'Install drying equipment and monitor ceiling',
                    status: 'pending'
                }
            ],
            equipment: [
                {
                    type: 'Air Mover',
                    count: 4,
                    location: 'Distributed',
                    purpose: 'Surface drying'
                },
                {
                    type: 'Dehumidifier',
                    count: 2,
                    location: 'One per floor',
                    purpose: 'Humidity control'
                }
            ],
            timeline: {
                estimated: 5 // days
            }
        });

        expect(scope.tasks).toHaveLength(2);
        expect(scope.equipment).toHaveLength(2);
    });

    test('4. Record Initial Moisture Readings', () => {
        // Bathroom readings
        moistureManagementService.addReading({
            area: 'Upstairs Bathroom',
            room: 'Main',
            readings: {
                subfloorWME: 85,
                flooringWME: 92,
                basePlateWME: 78,
                bottomWallWME: 82,
                scanReading: 85,
                relativeHumidity: 75,
                airTemp: 23,
                benchmarkWME: 15
            },
            timestamp: new Date().toISOString()
        });

        // Living room readings
        moistureManagementService.addReading({
            area: 'Living Room',
            room: 'Main',
            readings: {
                subfloorWME: 45,
                flooringWME: 85,
                basePlateWME: 88,
                bottomWallWME: 95,
                scanReading: 90,
                relativeHumidity: 78,
                airTemp: 22,
                benchmarkWME: 15
            },
            timestamp: new Date().toISOString()
        });

        const bathroomReadings = moistureManagementService.getLatestReading('Upstairs Bathroom', 'Main');
        const livingRoomReadings = moistureManagementService.getLatestReading('Living Room', 'Main');

        expect(bathroomReadings).toBeDefined();
        expect(livingRoomReadings).toBeDefined();
    });

    test('5. Setup Equipment Tracking', () => {
        // Add air movers
        for (let i = 1; i <= 4; i++) {
            equipmentTrackingService.installEquipment({
                type: 'Air Mover',
                serialNumber: `AM${i}`,
                modelNumber: 'AM2000',
                installDate: new Date().toISOString(),
                runtime: 0,
                powerUsage: 0,
                location: {
                    area: i <= 2 ? 'Upstairs Bathroom' : 'Living Room',
                    room: 'Main'
                }
            });
        }

        // Add dehumidifiers
        for (let i = 1; i <= 2; i++) {
            equipmentTrackingService.installEquipment({
                type: 'Dehumidifier',
                serialNumber: `DH${i}`,
                modelNumber: 'DH5000',
                installDate: new Date().toISOString(),
                runtime: 0,
                powerUsage: 0,
                location: {
                    area: i === 1 ? 'Upstairs Bathroom' : 'Living Room',
                    room: 'Main'
                }
            });
        }

        const activeEquipment = equipmentTrackingService.getActiveEquipment();
        expect(activeEquipment).toHaveLength(6);
    });

    test('6. Document Site Conditions', () => {
        // Add property photos
        documentationService.addPhoto({
            id: 'front1',
            type: 'property',
            timestamp: new Date().toISOString(),
            description: 'Front of property',
            url: 'photos/front1.jpg'
        });

        // Add damage photos
        documentationService.addPhoto({
            id: 'damage1',
            type: 'damage',
            area: 'Upstairs Bathroom',
            room: 'Main',
            timestamp: new Date().toISOString(),
            description: 'Water damage on bathroom floor',
            url: 'photos/damage1.jpg'
        });

        // Add moisture reading photos
        documentationService.addPhoto({
            id: 'moisture1',
            type: 'moisture',
            area: 'Living Room',
            room: 'Main',
            timestamp: new Date().toISOString(),
            description: 'Moisture reading of ceiling',
            url: 'photos/moisture1.jpg',
            metadata: {
                moistureReading: 95
            }
        });

        const photos = documentationService.getPhotos();
        expect(photos).toHaveLength(3);
    });

    test('7. Generate Progress Report', () => {
        const report = jobManagementService.generateProgressReport(jobId);
        
        expect(report.jobDetails).toBeDefined();
        expect(report.initialInspection).toBeDefined();
        expect(report.scope).toBeDefined();
        expect(report.moistureReadings).toBeDefined();
        expect(report.equipmentLogs).toBeDefined();
        expect(report.photos).toBeDefined();
    });

    test('8. Create Floor Plans', () => {
        // Create upstairs floor plan
        const upstairsFloorPlan = sketchService.createFloorPlan(jobId, 'upstairs', {
            width: 10,
            height: 8,
            unit: 'meters'
        });

        // Add bathroom
        const bathroom = sketchService.addRoom(jobId, 'upstairs', {
            name: 'Bathroom',
            dimensions: { width: 3, height: 4, unit: 'meters' },
            position: { x: 0, y: 0 },
            features: [
                {
                    type: 'window',
                    label: 'Window 1',
                    position: { x: 2.5, y: 0 }
                },
                {
                    type: 'door',
                    label: 'Door',
                    position: { x: 0, y: 2 }
                }
            ],
            affectedAreas: []
        });

        // Add affected area to bathroom
        sketchService.addAffectedArea(jobId, 'upstairs', bathroom.id, {
            position: { x: 1, y: 1 },
            size: { width: 2, height: 2, unit: 'meters' },
            damageType: 'water damage',
            severity: 'high'
        });

        // Add equipment to floor plan
        sketchService.addEquipment(jobId, 'upstairs', {
            type: 'Air Mover',
            serialNumber: 'AM1',
            position: { x: 1.5, y: 1.5 }
        });

        // Create living room floor plan
        const livingRoomFloorPlan = sketchService.createFloorPlan(jobId, 'ground', {
            width: 12,
            height: 10,
            unit: 'meters'
        });

        // Add living room
        const livingRoom = sketchService.addRoom(jobId, 'ground', {
            name: 'Living Room',
            dimensions: { width: 6, height: 5, unit: 'meters' },
            position: { x: 0, y: 0 },
            features: [
                {
                    type: 'window',
                    label: 'Window 1',
                    position: { x: 2, y: 0 }
                },
                {
                    type: 'furniture',
                    label: 'TV Stand',
                    position: { x: 3, y: 4 }
                }
            ],
            affectedAreas: []
        });

        // Add affected area to living room
        sketchService.addAffectedArea(jobId, 'ground', livingRoom.id, {
            position: { x: 1, y: 0 },
            size: { width: 4, height: 1, unit: 'meters' },
            damageType: 'water damage',
            severity: 'high'
        });

        // Add equipment to living room
        sketchService.addEquipment(jobId, 'ground', {
            type: 'Dehumidifier',
            serialNumber: 'DH1',
            position: { x: 2, y: 2.5 }
        });

        // Generate SVGs
        const upstairsSVG = sketchService.generateSVG(jobId, 'upstairs');
        const groundSVG = sketchService.generateSVG(jobId, 'ground');

        expect(upstairsSVG).toContain('svg');
        expect(groundSVG).toContain('svg');
        expect(sketchService.getAllFloorPlans(jobId)).toHaveLength(2);
    });

    test('9. Generate Reports', () => {
        // Generate initial report
        const initialReport = reportGenerationService.generateInitialReport(jobId);
        expect(initialReport).toContain('DISASTER RECOVERY QLD');
        expect(initialReport).toContain('John Smith');
        expect(initialReport).toContain('Water Damage');

        // Generate progress report
        const progressReport = reportGenerationService.generateProgressReport(jobId, new Date().toISOString());
        expect(progressReport).toContain('Moisture Readings');
        expect(progressReport).toContain('Equipment Installed');

        // Generate final report
        const finalReport = reportGenerationService.generateFinalReport(jobId, {
            includePhotos: true,
            includeMoistureReadings: true,
            includeEquipmentLogs: true,
            includeFloorPlans: true,
            includeThermalImages: true
        });
        expect(finalReport).toContain('Sign-off');
        expect(finalReport).toContain('Recommendations');
    });

    test('10. Load Property Template', async () => {
        // Search for property plans
        const plans = await propertyPlanService.searchPlans('123 Test Street, Brisbane QLD 4000');
        
        // Download and process plan
        if (plans.length > 0) {
            const processedPlan = await propertyPlanService.downloadPlan(plans[0].url);
            
            // Convert to template
            const template = await propertyPlanService.convertToTemplate(
                processedPlan.imageData,
                {
                    address: '123 Test Street, Brisbane QLD 4000'
                }
            );

            expect(template.id).toBeDefined();
            expect(template.metadata.address).toBe('123 Test Street, Brisbane QLD 4000');
        }
    });

    test('11. Perform LiDAR Scans', async () => {
        // Scan bathroom
        lidarService.startScan(jobId, 'Upstairs Bathroom', 'Main');
        
        // Add sample point cloud data
        for (let x = 0; x < 3; x += 0.1) {
            for (let y = 0; y < 4; y += 0.1) {
                // Floor points
                lidarService.addPoint({ x, y, z: 0 });
                // Ceiling points
                lidarService.addPoint({ x, y, z: 2.4 });
                // Wall points
                lidarService.addPoint({ x, y, z: y/2 });
            }
        }

        // Mark affected area
        lidarService.markAffectedArea([
            { x: 1, y: 1, z: 0 },
            { x: 1, y: 3, z: 0 },
            { x: 2, y: 3, z: 0 },
            { x: 2, y: 1, z: 0 }
        ], 'water damage', 'high');

        let bathroomScan = lidarService.completeScan();

        // If we have a template, align scan with it
        const templates = propertyPlanService.getTemplates(jobId);
        if (templates.length > 0) {
            const alignedTemplate = await propertyPlanService.alignWithScan(templates[0], bathroomScan);
            expect(alignedTemplate.dimensions.unit).toBe('meters');
        }
        expect(bathroomScan.dimensions.area).toBeGreaterThan(0);
        expect(bathroomScan.affectedAreas).toHaveLength(1);

        // Export to floor plan
        const floorPlan = lidarService.exportToFloorPlan(bathroomScan);
        expect(floorPlan.dimensions.width).toBe(3);
        expect(floorPlan.dimensions.height).toBe(4);
        expect(floorPlan.affectedAreas).toHaveLength(1);
    });

    test('12. Add Interactive Documentation', () => {
        // Add photo point to bathroom floor plan
        const bathroomPhoto = interactiveDocumentationService.addMediaPoint({
            type: 'photo',
            url: 'photos/bathroom-damage1.jpg',
            timestamp: new Date().toISOString(),
            coordinates: { x: 1.5, y: 2 },
            room: 'Bathroom',
            level: 'upstairs',
            jobId,
            notes: 'Severe water damage on floor',
            metadata: {
                moistureReading: 85
            }
        });

        // Add video point showing water leak
        const leakVideo = interactiveDocumentationService.addMediaPoint({
            type: 'video',
            url: 'videos/leak-source.mp4',
            timestamp: new Date().toISOString(),
            coordinates: { x: 2, y: 3 },
            room: 'Bathroom',
            level: 'upstairs',
            jobId,
            notes: 'Active leak from pipe'
        });

        // Create media group for affected area
        const damageGroup = interactiveDocumentationService.createMediaGroup(jobId, {
            points: [bathroomPhoto, leakVideo],
            area: {
                x: 1,
                y: 1,
                width: 2,
                height: 2
            },
            type: 'water damage',
            severity: 'high'
        });

        // Generate interactive SVG
        const interactiveSVG = interactiveDocumentationService.generateInteractiveSVG(
            jobId,
            'upstairs',
            'Bathroom'
        );

        // Generate media report
        const mediaReport = interactiveDocumentationService.generateMediaReport(jobId);

        expect(interactiveSVG).toContain('media-point');
        expect(interactiveSVG).toContain('media-group');
        expect(mediaReport).toContain('water damage');
        expect(mediaReport).toContain('Active leak from pipe');
    });

    test('13. Complete Safety Requirements', () => {
        // Create safety checklist
        const checklist = safetyService.createChecklist(jobId, 'Tech001');
        
        // Add hazards
        safetyService.addHazard(jobId, {
            type: 'Slip Hazard',
            risk: 'high',
            controls: ['Warning signs', 'Non-slip mats'],
            responsible: 'Tech001'
        });

        // Create SWMS
        const swms = safetyService.createSWMS(jobId, {
            address: '123 Test Street, Brisbane QLD 4000',
            scope: 'Water damage restoration',
            startDate: new Date().toISOString(),
            duration: '5 days'
        });

        // Add high risk work
        safetyService.addHighRiskWork(jobId, {
            type: 'Working at Heights',
            controls: ['Safety harness', 'Secure ladder'],
            permits: ['Working at heights permit']
        });

        // Create JSA
        const jsa = safetyService.createJSA(jobId, 'Water Extraction');
        
        // Add JSA steps
        safetyService.addJSAStep(jobId, {
            description: 'Setup equipment',
            hazards: ['Electric shock', 'Trip hazard'],
            controls: ['GFCI protection', 'Cable management'],
            responsible: 'Tech001'
        });

        // Check activation status before completing requirements
        let activationStatus = safetyService.canActivateJob(jobId);
        expect(activationStatus.canActivate).toBe(false);
        expect(activationStatus.requiredDocuments.frontPhoto).toBe(false);
        expect(activationStatus.requiredDocuments.safetyChecklist).toBe(false);
        expect(activationStatus.requiredDocuments.swms).toBe(false);
        expect(activationStatus.requiredDocuments.jsa).toBe(false);

        // Add front photo
        documentationService.addPhoto({
            id: 'front2',
            type: 'property',
            timestamp: new Date().toISOString(),
            description: 'Front of property - required documentation',
            url: 'photos/front2.jpg'
        });

        // Complete safety documentation
        checklist.siteInduction = true;
        checklist.emergencyProcedures = true;
        checklist.firstAidKit = true;
        checklist.workAreaSecured = true;
        checklist.properSignage = true;
        safetyService.completeChecklist(jobId, 'Tech001');
        safetyService.approveSWMS(jobId, 'Supervisor001');
        safetyService.approveJSA(jobId, 'Supervisor001');

        // Check activation status after completing requirements
        activationStatus = safetyService.canActivateJob(jobId);
        expect(activationStatus.canActivate).toBe(true);
        expect(activationStatus.requiredDocuments.frontPhoto).toBe(true);
        expect(activationStatus.requiredDocuments.safetyChecklist).toBe(true);
        expect(activationStatus.requiredDocuments.swms).toBe(true);
        expect(activationStatus.requiredDocuments.jsa).toBe(true);

        // Generate safety report
        const safetyReport = safetyService.generateSafetyReport(jobId);
        expect(safetyReport).toContain('Slip Hazard');
        expect(safetyReport).toContain('Working at Heights');
        expect(safetyReport).toContain('Water Extraction');
    });

    test('14. Handle Different Claim Types', () => {
        // Get available claim types
        const claimTypes = claimTypeService.getAllClaimTypes();
        expect(claimTypes.length).toBeGreaterThan(0);

        // Test Fire Damage Claim
        const fireClaim = claimTypeService.getClaimType('fire');
        expect(fireClaim?.iicrcStandards[0].code).toBe('FSRT');
        
        // Generate fire inspection checklist
        const fireChecklist = claimTypeService.generateInspectionChecklist('fire');
        expect(fireChecklist).toContain('Structural Integrity Check');
        expect(fireChecklist).toContain('Smoke Penetration Assessment');

        // Test Crime Scene Claim
        const crimeClaim = claimTypeService.getClaimType('crime');
        expect(crimeClaim?.iicrcStandards[0].code).toBe('GBAC');
        
        // Generate crime scene checklist
        const crimeChecklist = claimTypeService.generateInspectionChecklist('crime');
        expect(crimeChecklist).toContain('Contamination Mapping');
        expect(crimeChecklist).toContain('Evidence Documentation');

        // Test Clandestine Lab Claim
        const clanClaim = claimTypeService.getClaimType('clandestine');
        expect(clanClaim?.iicrcStandards[0].code).toBe('CMRT');
        
        // Generate clandestine lab checklist
        const clanChecklist = claimTypeService.generateInspectionChecklist('clandestine');
        expect(clanChecklist).toContain('Surface Testing');
        expect(clanChecklist).toContain('HVAC Contamination Check');

        // Validate inspection requirements
        const mockInspection = {
            structuralCheck: true,
            surfaceTesting: true,
            photoDocumentation: true
        };

        // Validate against fire requirements
        const fireValidation = claimTypeService.validateInspection('fire', mockInspection);
        expect(fireValidation.valid).toBe(true);

        // Validate against crime scene requirements
        const crimeValidation = claimTypeService.validateInspection('crime', mockInspection);
        expect(crimeValidation.valid).toBe(true);

        // Validate against clandestine lab requirements
        const clanValidation = claimTypeService.validateInspection('clandestine', mockInspection);
        expect(clanValidation.valid).toBe(true);
    });

    test('15. Handle SDS Management', async () => {
        // Get SDS by chemical name
        const bleachSDS = await sdsService.getSDSByName('Sodium Hypochlorite');
        expect(bleachSDS.chemical.name.toLowerCase()).toContain('sodium hypochlorite');
        expect(bleachSDS.sections).toBeDefined();

        // Verify it's cached
        expect(sdsService.hasSDSInCache('Sodium Hypochlorite')).toBe(true);

        // Get SDS from photo
        const photoBuffer = Buffer.from('mock photo data');
        const photoSDS = await sdsService.getSDSFromPhoto(photoBuffer);
        expect(photoSDS).toBeDefined();

        // Get SDS from voice input
        const audioBuffer = Buffer.from('mock audio data');
        const voiceSDS = await sdsService.getSDSFromVoice(audioBuffer);
        expect(voiceSDS).toBeDefined();

        // Generate Australian standard SDS
        const australianSDS = sdsService.generateAustralianSDS(bleachSDS);
        expect(australianSDS).toContain('SAFETY DATA SHEET');
        expect(australianSDS).toContain('According to Safe Work Australia Codes of Practice');
        expect(australianSDS).toContain('Hazard Classification');
        expect(australianSDS).toContain('Emergency Procedures');

        // Test cache expiry
        sdsService.clearExpiredCache();
        expect(sdsService.hasSDSInCache('Sodium Hypochlorite')).toBe(true);
    });

    test('16. Visualize Moisture Data', () => {
        const moistureMap = visualizationService.generateMoistureMap();
        
        expect(moistureMap.maps).toBeDefined();
        expect(moistureMap.summary.totalAreas).toBeGreaterThan(0);
        expect(moistureMap.summary.problemAreas).toBeDefined();
    });
});
