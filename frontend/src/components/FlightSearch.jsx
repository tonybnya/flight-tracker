import React, { useState } from 'react';
import { Search, Plane, Calendar, Clock, MapPin } from 'lucide-react';
import FlightMap from './FlightMap';

const FlightSearch = () => {
    const [flightNumber, setFlightNumber] = useState('');
    const [flightData, setFlightData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFlightData(null);

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/flights/${flightNumber}`);
            if (!response.ok) {
                throw new Error('No flights found for that number.');
            }
            const data = await response.json();
            setFlightData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 text-white">
                        <Plane className="w-6 h-6 transform -rotate-45" />
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900 mb-2">Flight Tracker</h1>
                    <p className="text-gray-500">Track any flight, anytime, anywhere.</p>
                </div>

                <form onSubmit={handleSearch} className="relative mb-12">
                    <input
                        type="text"
                        className="w-full py-4 pl-6 pr-14 text-lg bg-white rounded-full shadow-lg border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 placeholder-gray-400"
                        placeholder="Search by IATA flight number (e.g., AA123)"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                    </button>
                </form>

                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-xl text-center mb-6">
                        {error}
                    </div>
                )}
            </div>

            {flightData && (
                <div className="mt-12">
                    <div className="text-center mb-8">
                        <span className="inline-block bg-green-50 text-green-700 text-sm font-medium px-6 py-2 rounded-full border border-green-200 shadow-sm animate-pulse">
                            ✨ Flight found! Click the card results to add to Google Calendar
                        </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        <a
                            href={(() => {
                                const startTime = new Date(flightData.start_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
                                const endTime = new Date(flightData.end_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
                                const title = `Flight ${flightData.airline} ${flightData.flight_number}`;
                                const details = `Flight from ${flightData.origin.city} (${flightData.origin.code}) to ${flightData.destination.city} (${flightData.destination.code})`;
                                const location = `${flightData.origin.city} to ${flightData.destination.city}`;

                                return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
                            })()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-full hover:scale-[1.02] active:scale-95 transition-transform duration-200 cursor-pointer"
                        >
                            <div className="bg-white rounded-3xl shadow-xl p-8 h-full flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-blue-50 rounded-full">
                                        <Plane className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{flightData.airline}</h3>
                                        <p className="text-gray-500 text-sm">{flightData.flight_number}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Origin</p>
                                        <h2 className="text-4xl font-bold text-gray-900 mb-1">{flightData.origin.code}</h2>
                                        <p className="text-gray-600 text-sm">{flightData.origin.city}</p>
                                        <div className="mt-4 flex flex-col gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-900">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm font-bold">{new Date(flightData.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium mt-1 pl-6">({flightData.origin.timezone})</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold pl-1">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{new Date(flightData.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 px-4 self-center hidden sm:block">
                                        <div className="text-center mb-1">
                                            <span className="inline-flex flex-col items-center">
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Duration</span>
                                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100">
                                                    {(() => {
                                                        const start = new Date(flightData.start_time);
                                                        const end = new Date(flightData.end_time);
                                                        const diffMs = end - start;
                                                        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                                                        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                                        return `${diffHrs}h ${diffMins}m`;
                                                    })()}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="border-t-2 border-dashed border-gray-200 relative top-3"></div>
                                        <div className="text-center mt-4">
                                            <Plane className="w-5 h-5 text-gray-300 mx-auto rotate-90" />
                                        </div>
                                    </div>

                                    <div className="text-right flex-1">
                                        <p className="text-gray-400 text-sm mb-1 flex items-center gap-1 justify-end">Destination <MapPin className="w-3 h-3" /></p>
                                        <h2 className="text-4xl font-bold text-gray-900 mb-1">{flightData.destination.code}</h2>
                                        <p className="text-gray-600 text-sm">{flightData.destination.city}</p>
                                        <div className="mt-4 flex flex-col gap-3 items-end">
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-gray-900 justify-end">
                                                    <span className="text-sm font-bold">{new Date(flightData.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium mt-1 pr-6">({flightData.destination.timezone})</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold pr-1">
                                                <span>{new Date(flightData.end_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {flightData.stopovers && flightData.stopovers.length > 0 && (
                                    <div className="pt-6 border-t border-gray-100 mt-auto">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                            <span className="font-medium">Stopover:</span>
                                            {flightData.stopovers.join(", ")}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </a>
                        <FlightMap origin={flightData.origin} destination={flightData.destination} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightSearch;
