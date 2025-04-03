import React, { useState } from 'react';
import { useProfileData } from '@/contexts/ProfileDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';

const ProfileDebug: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { profileData, dnaAnalysisData, debugInfo, error, isLoading } = useProfileData();
  const { user } = useAuth();

  if (isLoading) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getRelationshipStatus = () => {
    if (!profileData || !dnaAnalysisData) return "Unknown - missing data";
    
    if (profileData.assessment_id === dnaAnalysisData.assessment_id) {
      return "✅ CORRECT: profile.assessment_id matches dna_analysis_results.assessment_id";
    } else if (profileData.assessment_id === dnaAnalysisData.id) {
      return "⚠️ INCORRECT: profile.assessment_id matches dna_analysis_results.id instead of assessment_id";
    } else {
      return "❌ BROKEN: No matching relationship found";
    }
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 max-w-lg">
      <Button 
        onClick={toggleExpanded}
        variant="outline"
        className="flex items-center gap-2 mb-2 mr-2 bg-yellow-100 text-black border-yellow-300 hover:bg-yellow-200"
      >
        <Bug size={16} />
        Profile Debug
        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </Button>

      {isExpanded && (
        <div className="bg-black/90 text-white p-4 rounded-md mr-2 mb-2 max-h-[80vh] overflow-auto">
          <h3 className="text-lg font-bold mb-2">Profile Data Debug</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold">Relationship Status:</h4>
            <div className="text-xs bg-gray-800 p-2 rounded">
              {dnaAnalysisData && profileData ? (
                <>
                  {profileData.assessment_id === dnaAnalysisData.assessment_id ? (
                    <p className="text-green-400">✅ CORRECT: profile.assessment_id matches dna_analysis_results.assessment_id</p>
                  ) : profileData.assessment_id === dnaAnalysisData.id ? (
                    <p className="text-yellow-400">⚠️ INCORRECT: profile.assessment_id matches dna_analysis_results.id instead of assessment_id</p>
                  ) : (
                    <p className="text-red-400">❌ ERROR: No matching relationship found</p>
                  )}
                </>
              ) : (
                "Unknown - missing data"
              )}
              <p className="mt-2">Correct relationship: profile.assessment_id should match dna_analysis_results.assessment_id</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">User Info:</h4>
            <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo?.userId || "No user ID", null, 2)}
            </pre>
          </div>

          {error && (
            <div className="mb-4 text-red-400">
              <h4 className="font-semibold">Error:</h4>
              <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </div>
          )}

          <div className="mb-4">
            <h4 className="font-semibold">Profile Data:</h4>
            <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
              {JSON.stringify({
                id: profileData?.id,
                full_name: profileData?.full_name,
                assessment_id: profileData?.assessment_id,
                user_id: profileData?.user_id,
                outseta_user_id: profileData?.outseta_user_id
              }, null, 2)}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">DNA Analysis Data Status:</h4>
            {dnaAnalysisData ? (
              <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
                {JSON.stringify({
                  id: dnaAnalysisData?.id,
                  assessment_id: dnaAnalysisData?.assessment_id,
                  archetype: dnaAnalysisData?.archetype,
                  most_kindred_spirit: dnaAnalysisData?.most_kindred_spirit,
                  most_challenging_voice: dnaAnalysisData?.most_challenging_voice,
                }, null, 2)}
              </pre>
            ) : (
              <div className="text-red-400">No DNA data loaded</div>
            )}
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">Debug Steps:</h4>
            <div className="space-y-2">
              {debugInfo?.steps?.map((step: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-xs ${step.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}
                >
                  <div className="font-bold">{step.step}</div>
                  <pre className="text-xs">{JSON.stringify(step, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">DNA Data Found Method:</h4>
            <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
              {debugInfo?.warning ? (
                <span className="text-yellow-400">{debugInfo.warning}</span>
              ) : (
                JSON.stringify(debugInfo?.dnaDataFound || "No DNA data found", null, 2)
              )}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">Thinker Names:</h4>
            <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo?.thinkerNames || "No thinker names", null, 2)}
            </pre>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">Database IDs:</h4>
            <div className="text-xs p-2 bg-gray-800 rounded">
              <p><strong>Your User ID:</strong> {debugInfo?.userId || user?.id || "No user ID"}</p>
              <p><strong>Profile ID:</strong> {profileData?.id}</p>
              <p><strong>Profile Assessment ID (linking field):</strong> {profileData?.assessment_id}</p>
              <p><strong>DNA Data ID:</strong> {dnaAnalysisData?.id}</p>
              <p><strong>DNA Assessment ID (should match profile.assessment_id):</strong> {dnaAnalysisData?.assessment_id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDebug; 