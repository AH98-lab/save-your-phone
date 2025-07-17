export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  cookieEnabled: boolean;
  onlineStatus: boolean;
  screenResolution: string;
  timezone: string;
  deviceMemory?: number;
  hardwareConcurrency: number;
  connectionType?: string;
  batteryLevel?: number;
  chargingStatus?: boolean;
  deviceAge: string;
  osVersion: string;
  securityScore: number;
}

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  plugins: string[];
  extensions: any[];
  localStorage: boolean;
  sessionStorage: boolean;
  doNotTrack: string | null;
  javaEnabled: boolean;
}

export interface SecurityThreat {
  type: 'extension' | 'setting' | 'network' | 'malware' | 'privacy' | 'permissions' | 'storage' | 'location' | 'camera' | 'microphone' | 'app' | 'file' | 'virus' | 'trojan' | 'spyware' | 'adware' | 'rootkit';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  riskLevel: number;
  autoFixAvailable: boolean;
  filePath?: string;
  appName?: string;
  fileSize?: number;
  lastModified?: Date;
}

export interface ScanResult {
  deviceInfo: DeviceInfo;
  browserInfo: BrowserInfo;
  threats: SecurityThreat[];
  securityScore: number;
}

export class SecurityScanner {
  async scanDevice(): Promise<ScanResult> {
    const deviceInfo = await this.getDeviceInfo();
    const browserInfo = await this.getBrowserInfo();
    const threats = await this.detectThreats(deviceInfo, browserInfo);
    const securityScore = this.calculateSecurityScore(threats);

    return {
      deviceInfo,
      browserInfo,
      threats,
      securityScore
    };
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    const nav = navigator as any;
    
    // Get battery info if available
    let batteryLevel = undefined;
    let chargingStatus = undefined;
    try {
      const battery = await (nav.getBattery?.() || Promise.resolve(null));
      if (battery) {
        batteryLevel = Math.round(battery.level * 100);
        chargingStatus = battery.charging;
      }
    } catch (e) {
      // Battery API not available
    }

    // Get connection info
    let connectionType = undefined;
    try {
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      if (connection) {
        connectionType = connection.effectiveType || connection.type;
      }
    } catch (e) {
      // Connection API not available
    }

    // Calculate device age based on user agent
    const deviceAge = this.calculateDeviceAge(navigator.userAgent);
    const osVersion = this.extractOSVersion(navigator.userAgent);
    
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      connectionType,
      batteryLevel,
      chargingStatus,
      deviceAge,
      osVersion,
      securityScore: 0 // Will be calculated later
    };

    deviceInfo.securityScore = this.calculateDeviceSecurityScore(deviceInfo);
    return deviceInfo;
  }

  private calculateDeviceAge(userAgent: string): string {
    const currentYear = new Date().getFullYear();
    
    const androidMatch = userAgent.match(/Android (\d+)/);
    if (androidMatch) {
      const androidVersion = parseInt(androidMatch[1]);
      const releaseYear = this.getAndroidReleaseYear(androidVersion);
      const age = currentYear - releaseYear;
      return age <= 1 ? 'حديث' : age <= 3 ? 'متوسط' : 'قديم';
    }
    
    const iosMatch = userAgent.match(/OS (\d+)_/);
    if (iosMatch) {
      const iosVersion = parseInt(iosMatch[1]);
      const releaseYear = this.getIOSReleaseYear(iosVersion);
      const age = currentYear - releaseYear;
      return age <= 1 ? 'حديث' : age <= 3 ? 'متوسط' : 'قديم';
    }
    
    return 'غير محدد';
  }

  private extractOSVersion(userAgent: string): string {
    const androidMatch = userAgent.match(/Android (\d+\.\d+)/);
    if (androidMatch) return `Android ${androidMatch[1]}`;
    
    const iosMatch = userAgent.match(/OS (\d+)_(\d+)/);
    if (iosMatch) return `iOS ${iosMatch[1]}.${iosMatch[2]}`;
    
    const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
    if (windowsMatch) return `Windows ${windowsMatch[1]}`;
    
    return 'غير محدد';
  }

  private getAndroidReleaseYear(version: number): number {
    const releases: { [key: number]: number } = {
      14: 2023, 13: 2022, 12: 2021, 11: 2020, 10: 2019, 
      9: 2018, 8: 2017, 7: 2016, 6: 2015, 5: 2014
    };
    return releases[version] || 2020;
  }

  private getIOSReleaseYear(version: number): number {
    const releases: { [key: number]: number } = {
      17: 2023, 16: 2022, 15: 2021, 14: 2020, 13: 2019,
      12: 2018, 11: 2017, 10: 2016, 9: 2015, 8: 2014
    };
    return releases[version] || 2020;
  }

  private calculateDeviceSecurityScore(device: DeviceInfo): number {
    let score = 100;
    
    if (device.deviceAge === 'قديم') score -= 20;
    else if (device.deviceAge === 'متوسط') score -= 10;
    
    if (device.connectionType && ['slow-2g', '2g'].includes(device.connectionType)) {
      score -= 15;
    }
    
    if (device.batteryLevel && device.batteryLevel < 20) score -= 5;
    
    if (device.deviceMemory && device.deviceMemory >= 4) score += 5;
    if (device.hardwareConcurrency >= 4) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private async getBrowserInfo(): Promise<BrowserInfo> {
    const plugins = Array.from(navigator.plugins).map(plugin => plugin.name);
    
    // Detect browser
    const userAgent = navigator.userAgent.toLowerCase();
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let engine = 'Unknown';

    if (userAgent.includes('chrome')) {
      browserName = 'Chrome';
      const match = userAgent.match(/chrome\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
      engine = 'Blink';
    } else if (userAgent.includes('firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/firefox\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
      engine = 'Gecko';
    } else if (userAgent.includes('safari')) {
      browserName = 'Safari';
      const match = userAgent.match(/version\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
      engine = 'WebKit';
    } else if (userAgent.includes('edge')) {
      browserName = 'Edge';
      const match = userAgent.match(/edge\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
      engine = 'EdgeHTML';
    }

    return {
      name: browserName,
      version: browserVersion,
      engine,
      plugins,
      extensions: [], // Extensions detection requires special permissions
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      doNotTrack: navigator.doNotTrack,
      javaEnabled: navigator.javaEnabled?.() || false
    };
  }

  private async detectThreats(deviceInfo: DeviceInfo, browserInfo: BrowserInfo): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];

    // Advanced malware detection
    await this.detectMalwareThreats(threats, deviceInfo, browserInfo);
    
    // App security analysis
    await this.detectSuspiciousApps(threats, deviceInfo);
    
    // File system security scan
    await this.detectMaliciousFiles(threats);
    
    // Network security analysis
    await this.detectNetworkThreats(threats, deviceInfo);
    
    // Privacy and permissions audit
    await this.detectPrivacyThreats(threats, browserInfo);
    
    // System security assessment
    await this.detectSystemThreats(threats, deviceInfo);

    // Advanced Device Age Security Check
    if (deviceInfo.deviceAge === 'قديم') {
      threats.push({
        type: 'setting',
        severity: 'critical',
        title: 'جهاز قديم معرض للخطر',
        description: 'جهازك قديم ولا يتلقى تحديثات أمنية، مما يجعله عرضة للاختراق',
        recommendation: 'استبدل جهازك أو قم بتحديث نظام التشغيل فوراً',
        riskLevel: 95,
        autoFixAvailable: false
      });
    }

    // Battery Security Risk Check
    if (deviceInfo.batteryLevel && deviceInfo.batteryLevel < 15) {
      threats.push({
        type: 'privacy',
        severity: 'medium',
        title: 'خطر أمني بسبب انخفاض البطارية',
        description: 'البطارية منخفضة جداً، قد يؤدي إلى تعطيل ميزات الأمان',
        recommendation: 'اشحن جهازك فوراً لضمان عمل ميزات الأمان',
        riskLevel: 60,
        autoFixAvailable: false
      });
    }

    // Memory and Performance Security Check
    if (deviceInfo.deviceMemory && deviceInfo.deviceMemory < 2) {
      threats.push({
        type: 'setting',
        severity: 'high',
        title: 'ذاكرة منخفضة تؤثر على الأمان',
        description: 'ذاكرة الجهاز منخفضة، مما قد يعطل عمل تطبيقات الأمان',
        recommendation: 'أغلق التطبيقات غير الضرورية أو ترقّ الجهاز',
        riskLevel: 75,
        autoFixAvailable: true
      });
    }

    // Connection Security Analysis
    if (deviceInfo.connectionType) {
      if (['slow-2g', '2g'].includes(deviceInfo.connectionType)) {
        threats.push({
          type: 'network',
          severity: 'high',
          title: 'شبكة غير آمنة',
          description: 'اتصالك بشبكة بطيئة قد تكون غير محمية أو مخترقة',
          recommendation: 'استخدم شبكة WiFi آمنة أو بيانات الهاتف المحمول',
          riskLevel: 80,
          autoFixAvailable: false
        });
      }
    }

    // Browser Plugin Security Check
    const suspiciousPlugins = ['Fake', 'Unknown', 'Suspicious', 'Ad Blocker Plus', 'Free VPN'];
    browserInfo.plugins.forEach(plugin => {
      if (suspiciousPlugins.some(suspicious => plugin.toLowerCase().includes(suspicious.toLowerCase()))) {
        threats.push({
          type: 'extension',
          severity: 'critical',
          title: 'إضافة خطيرة مكتشفة',
          description: `إضافة "${plugin}" قد تسرق بياناتك الشخصية والمصرفية`,
          recommendation: 'احذف هذه الإضافة فوراً وغيّر كلمات مرورك',
          riskLevel: 90,
          autoFixAvailable: true
        });
      }
    });

    // Storage Privacy Risk
    if (!browserInfo.localStorage || !browserInfo.sessionStorage) {
      threats.push({
        type: 'storage',
        severity: 'medium',
        title: 'مشكلة في تخزين البيانات',
        description: 'إعدادات التخزين معطلة، قد يؤثر على حفظ بياناتك بأمان',
        recommendation: 'تفعيل إعدادات التخزين المحلي للمواقع الموثوقة',
        riskLevel: 50,
        autoFixAvailable: true
      });
    }

    // Location Privacy Check (simulated)
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1000 });
      });
      threats.push({
        type: 'location',
        severity: 'high',
        title: 'الموقع الجغرافي مكشوف',
        description: 'موقعك الجغرافي يمكن الوصول إليه بسهولة من المواقع',
        recommendation: 'اطفئ خدمات الموقع أو اجعلها للتطبيقات الضرورية فقط',
        riskLevel: 70,
        autoFixAvailable: true
      });
    } catch (e) {
      // Location not accessible - this is actually good for privacy
    }

    // Microphone/Camera Access Check (simulated)
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');
      
      if (hasCamera || hasMicrophone) {
        threats.push({
          type: 'permissions',
          severity: 'critical',
          title: 'إمكانية الوصول للكاميرا والميكروفون',
          description: 'المواقع يمكنها طلب الوصول لكاميرا وميكروفون جهازك',
          recommendation: 'امنع المواقع من الوصول للكاميرا والميكروفون إلا عند الضرورة',
          riskLevel: 85,
          autoFixAvailable: true
        });
      }
    } catch (e) {
      // Media devices not accessible
    }

    // Malware Simulation Based on Suspicious Patterns
    const userAgent = deviceInfo.userAgent.toLowerCase();
    const malwarePatterns = ['hack', 'crack', 'patch', 'mod', 'fake'];
    if (malwarePatterns.some(pattern => userAgent.includes(pattern))) {
      threats.push({
        type: 'malware',
        severity: 'critical',
        title: 'احتمالية وجود برمجيات خبيثة',
        description: 'تم اكتشاف أنماط مشبوهة قد تشير لوجود برمجيات خبيثة على جهازك',
        recommendation: 'قم بفحص جهازك بمضاد فيروسات قوي وأعد تثبيت النظام',
        riskLevel: 95,
        autoFixAvailable: false
      });
    }

    // HTTPS Security Check
    if (!window.location.protocol.includes('https')) {
      threats.push({
        type: 'network',
        severity: 'critical',
        title: 'اتصال غير مشفر خطير',
        description: 'أنت تتصفح بروتوكول HTTP غير الآمن، بياناتك مكشوفة للجميع',
        recommendation: 'اخرج من الموقع فوراً واستخدم مواقع HTTPS فقط',
        riskLevel: 90,
        autoFixAvailable: false
      });
    }

    // Do Not Track Privacy Check
    if (browserInfo.doNotTrack !== '1') {
      threats.push({
        type: 'privacy',
        severity: 'medium',
        title: 'إعدادات الخصوصية ضعيفة',
        description: 'إعداد "عدم التتبع" غير مفعل، مما يسمح للمواقع بتتبعك',
        recommendation: 'فعّل خاصية "عدم التتبع" في إعدادات المتصفح',
        riskLevel: 55,
        autoFixAvailable: true
      });
    }

    return threats;
  }

  private calculateSecurityScore(threats: SecurityThreat[]): number {
    let score = 100;
    
    threats.forEach(threat => {
      switch (threat.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  // Additional malware detection methods
  private async detectMalwareThreats(threats: SecurityThreat[], deviceInfo: DeviceInfo, browserInfo: BrowserInfo): Promise<void> {
    // Detect potential adware
    if (browserInfo.plugins.length > 15) {
      threats.push({
        type: 'adware',
        severity: 'medium',
        title: 'إضافات متصفح مفرطة',
        description: `تم اكتشاف ${browserInfo.plugins.length} إضافة في المتصفح، قد تحتوي على برامج إعلانية.`,
        recommendation: 'راجع وأزل الإضافات غير الضرورية.',
        riskLevel: 70,
        autoFixAvailable: false
      });
    }

    // Check for spyware indicators
    if (browserInfo.plugins.some(plugin => plugin.toLowerCase().includes('tracking'))) {
      threats.push({
        type: 'spyware',
        severity: 'critical',
        title: 'برنامج تجسس محتمل',
        description: 'تم اكتشاف إضافات تتبع قد تراقب نشاطك.',
        recommendation: 'احذف جميع الإضافات المشبوهة فوراً.',
        riskLevel: 95,
        autoFixAvailable: false
      });
    }
  }

  private async detectSuspiciousApps(threats: SecurityThreat[], deviceInfo: DeviceInfo): Promise<void> {
    // Simulate suspicious app detection
    const suspiciousApps = ['مدير التطبيقات المجهول', 'محسن النظام', 'منظف الخصوصية'];
    
    if (Math.random() > 0.7) {
      threats.push({
        type: 'app',
        severity: 'high',
        title: `تطبيق مشبوه: ${suspiciousApps[0]}`,
        description: 'تم اكتشاف تطبيق يظهر سلوكاً مشبوهاً.',
        recommendation: 'احذف التطبيق المشبوه وافحص النظام.',
        riskLevel: 80,
        autoFixAvailable: false,
        appName: suspiciousApps[0]
      });
    }
  }

  private async detectMaliciousFiles(threats: SecurityThreat[]): Promise<void> {
    // Simulate malicious file detection
    if (Math.random() > 0.8) {
      const maliciousFiles = [
        { name: 'virus.exe', type: 'virus', risk: 95 },
        { name: 'trojan.dll', type: 'trojan', risk: 90 }
      ];

      maliciousFiles.forEach(file => {
        threats.push({
          type: file.type as any,
          severity: 'critical',
          title: `ملف ضار: ${file.name}`,
          description: `تم اكتشاف ملف ضار "${file.name}" في النظام.`,
          recommendation: `احذف "${file.name}" فوراً وقم بفحص شامل.`,
          riskLevel: file.risk,
          autoFixAvailable: true,
          filePath: `/temp/${file.name}`,
          fileSize: Math.floor(Math.random() * 1000000)
        });
      });
    }
  }

  private async detectNetworkThreats(threats: SecurityThreat[], deviceInfo: DeviceInfo): Promise<void> {
    // Simulate network threat detection
    if (Math.random() > 0.6) {
      threats.push({
        type: 'network',
        severity: 'high',
        title: 'نشاط شبكة مشبوه',
        description: 'تم اكتشاف اتصالات مشبوهة قد تشير لبرامج ضارة.',
        recommendation: 'راقب نشاط الشبكة واستخدم جدار حماية.',
        riskLevel: 85,
        autoFixAvailable: true
      });
    }
  }

  private async detectPrivacyThreats(threats: SecurityThreat[], browserInfo: BrowserInfo): Promise<void> {
    // Enhanced privacy threat detection
    if (!browserInfo.doNotTrack) {
      threats.push({
        type: 'privacy',
        severity: 'medium',
        title: 'ميزة عدم التتبع معطلة',
        description: 'المتصفح لا يطلب من المواقع عدم تتبعك.',
        recommendation: 'فعّل "عدم التتبع" في إعدادات المتصفح.',
        riskLevel: 50,
        autoFixAvailable: true
      });
    }
  }

  private async detectSystemThreats(threats: SecurityThreat[], deviceInfo: DeviceInfo): Promise<void> {
    // Check for rootkit indicators
    if (deviceInfo.securityScore < 40) {
      threats.push({
        type: 'rootkit',
        severity: 'critical',
        title: 'نشاط روت كيت محتمل',
        description: 'سلوك النظام يشير لإصابة محتملة بروت كيت.',
        recommendation: 'قم بفحص عميق بأدوات متخصصة.',
        riskLevel: 98,
        autoFixAvailable: false
      });
    }
  }
}

export const securityScanner = new SecurityScanner();
