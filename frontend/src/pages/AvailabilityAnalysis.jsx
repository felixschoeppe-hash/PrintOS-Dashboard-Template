import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  RotateCcw,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker, PRESETS } from "@/components/DateRangePicker";
import { format, differenceInDays } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { useDevices } from "@/hooks/useDevices";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { API_URL } from '@/config';

// Hilfskomponente für stabile Ladezustände ohne Layout-Shift
const MetricValue = ({ value, loading, className = "", suffix = "" }) => {
  if (loading) return <span className="animate-pulse text-slate-500">...</span>;
  return <span className={className}>{value !== undefined && value !== null ? value : 0}{suffix}</span>;
};

export default function AvailabilityAnalysis({ selectedDevice }) {
  const { deviceNames } = useDevices();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Default auf "Letzte 3 Monate"
  const [dateRange, setDateRange] = useState(PRESETS.last3months.getRange());
  
  // WICHTIG: Verzögertes Rendering für Charts gegen width(-1) Fehler
  const [chartsMounted, setChartsMounted] = useState(false);

  // Prüfen für Warnhinweis
  const isOlderThan90Days = useMemo(() => {
    if (!dateRange.from) return false;
    const daysDiff = differenceInDays(new Date(), dateRange.from);
    return daysDiff > 95; 
  }, [dateRange.from]);

  useEffect(() => {
    // 500ms warten, damit das Grid-Layout stabil ist, bevor Charts rendern
    const timer = setTimeout(() => {
      setChartsMounted(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchAnalysisData();
  }, [selectedDevice, dateRange]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const fromDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "";
      const toDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "";
      
      const params = { 
        device_id: selectedDevice,
        from_date: fromDate,
        to_date: toDate
      };
      
      const res = await axios.get(`${API_URL}/analysis/availability`, { params });
      setAnalysisData(res.data);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      toast.error("Fehler beim Laden der Analysedaten");
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalysisData().finally(() => setRefreshing(false));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.substring(5); // MM-DD
  };

  const getAvailabilityColor = (value) => {
    if (!value) return "text-white";
    if (value >= 90) return "text-emerald-400";
    if (value >= 75) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="space-y-6 animate-slide-up" data-testid="availability-analysis-page">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-500" />
            Availability Analysis
          </h1>
          <p className="text-slate-400 mt-1">
            {deviceNames[selectedDevice]} - Verfügbarkeits- und Fehleranalyse
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            defaultPreset="last3months"
            allowedPresets={[
              "today", "yesterday", "last7days", "last30days", 
              "last3months", "thisMonth", "lastMonth"
            ]}
          />
          <Button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
            data-testid="refresh-analysis-button"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing || loading ? "animate-spin" : ""}`} />
            Aktualisieren
          </Button>
        </div>
      </div>

      {isOlderThan90Days && (
        <Alert className="bg-blue-950/50 border-blue-800 text-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Hinweis zur Datenspeicherung</AlertTitle>
          <AlertDescription>
            Zeitraum &gt; 90 Tage: Detaillierte Fehlerprotokolle sind möglicherweise nicht mehr verfügbar (HP API Limit).
          </AlertDescription>
        </Alert>
      )}

      {/* Availability Analysis Section */}
      <Card className="industrial-card border-emerald-500/30" data-testid="availability-section">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            🟢 Availability Analysis - Verfügbarkeit über Zeit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Average Availability */}
            <div className="bg-slate-800/50 rounded-lg p-6 text-center flex flex-col justify-center">
              <p className="text-slate-400 text-sm mb-2">Ø Verfügbarkeit</p>
              <p className={`text-5xl font-bold font-mono ${getAvailabilityColor(analysisData?.availability?.average)}`}>
                <MetricValue 
                  value={analysisData?.availability?.average} 
                  loading={loading} 
                  suffix="%"
                />
              </p>
            </div>
            
            {/* Availability Trend Chart */}
            <div className="lg:col-span-3">
              {/* FIX: h-64 in Tailwind ist 256px. Wir setzen height={256} fest. */}
              <div className="w-full min-w-0">
                {chartsMounted && !loading && analysisData?.availability?.trend?.length > 0 ? (
                  <ResponsiveContainer width="99%" height={256} minWidth={0} debounce={50}>
                    <AreaChart data={analysisData.availability.trend}>
                      <defs>
                        <linearGradient id="colorAvailability" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={formatDate}
                      />
                      <YAxis 
                        stroke="#64748b"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '4px'
                        }}
                        formatter={(value) => [`${value}%`, "Verfügbarkeit"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorAvailability)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    {loading ? "Lade Chart..." : "Keine Daten verfügbar"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Issues Analysis Section */}
      <Card className="industrial-card border-amber-500/30" data-testid="technical-issues-section">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            ⚠️ Technical Issues Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Failure Rate Stats */}
            <div className="space-y-4">
              <h4 className="text-slate-300 font-medium text-sm">Failure Rate / 1M Impressions</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-xs mb-1">Ø Durchschnitt</p>
                  <MetricValue value={analysisData?.technicalIssues?.failureRate?.average} loading={loading} className="text-amber-400 font-bold" />
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-xs mb-1">Maximum</p>
                  <MetricValue value={analysisData?.technicalIssues?.failureRate?.max} loading={loading} className="text-rose-400 font-bold" />
                </div>
              </div>
            </div>
            
            {/* Paper Jam Rate Stats */}
            <div className="space-y-4">
              <h4 className="text-slate-300 font-medium text-sm">Paper Jam Rate / 1M Sheets</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-xs mb-1">Ø Durchschnitt</p>
                  <MetricValue value={analysisData?.technicalIssues?.paperJamRate?.average} loading={loading} className="text-amber-400 font-bold" />
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-xs mb-1">Maximum</p>
                  <MetricValue value={analysisData?.technicalIssues?.paperJamRate?.max} loading={loading} className="text-rose-400 font-bold" />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Chart */}
          {/* FIX: h-64 = 256px. Width 99% für Grid-Safety */}
          <div className="mt-6 w-full min-w-0">
            {chartsMounted && !loading && analysisData?.technicalIssues?.dailyData?.length > 0 ? (
              <ResponsiveContainer width="99%" height={256} minWidth={0} debounce={50}>
                <BarChart data={analysisData.technicalIssues.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="failures" fill="#f59e0b" name="Failures / 1M" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="jams" fill="#ef4444" name="Paper Jams / 1M" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                {loading ? "Lade Chart..." : "Keine Daten verfügbar"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Restarts Analysis Section */}
      <Card className="industrial-card border-cyan-500/30" data-testid="restarts-section">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-cyan-500" />
            🔄 Restarts Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Restart Stats */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Ø Restart Rate</p>
                <MetricValue value={analysisData?.restarts?.averageRate} loading={loading} className="text-cyan-400 font-bold text-3xl" />
                <p className="text-slate-500 text-xs">pro Tag</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Max Rate</p>
                <MetricValue value={analysisData?.restarts?.maxRate} loading={loading} className="text-rose-400 font-bold text-3xl" />
                <p className="text-slate-500 text-xs">pro Tag</p>
              </div>
            </div>
            
            {/* Restarts Chart */}
            <div className="lg:col-span-3 w-full min-w-0">
              {/* FIX: h-48 = 192px. Width 99% für Grid-Safety */}
              {chartsMounted && !loading && analysisData?.restarts?.dailyData?.length > 0 ? (
                <ResponsiveContainer width="99%" height={192} minWidth={0} debounce={50}>
                  <BarChart data={analysisData.restarts.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={formatDate}
                    />
                    <YAxis 
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '4px'
                      }}
                    />
                    <Bar dataKey="restarts" fill="#06b6d4" name="Restarts" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-500">
                  {loading ? "Lade Chart..." : "Keine Neustarts verzeichnet"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
