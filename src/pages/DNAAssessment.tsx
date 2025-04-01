<div className="mt-8 text-center">
              <button 
                className="font-oxanium text-[#332E38]/25 uppercase tracking-wider text-sm font-bold"
                onClick={() => setShowAIChat(true)}
              >
                I HAVE MORE TO SAY
              </button>
              
              <button 
                className="font-oxanium text-[#332E38]/50 uppercase tracking-wider text-sm font-bold ml-4 p-2 border border-dashed border-[#332E38]/30"
                onClick={() => navigate('/dna/completion')}
              >
                TEST COMPLETION SCREEN
              </button>
            </div>
          </div>
          
          <div className="w-full max-w-md mx-auto mb-16 px-6 absolute bottom-0 left-0 right-0">
            <Button 
              onClick={handleContinue}
              disabled={selectedAnswer === null}
              className={`w-full h-[52px] rounded-2xl font-oxanium text-sm font-bold uppercase tracking-wider border transition-colors duration-200 ${
                selectedAnswer !== null 
                  ? "bg-[#373763] text-[#E9E7E2] hover:bg-[#373763]/90 border-[#373763]" 
                  : "bg-[#E9E7E2] text-[#373763] border-[#373763]/20 cursor-not-allowed"
              }`}
            >
              CONTINUE
            </Button>
          </div>
        </div>

        <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
          <AlertDialogContent className="bg-[#E9E7E2]">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-libre-baskerville font-bold">Need some time to think?</AlertDialogTitle>
              <AlertDialogDescription className="font-oxanium">
                These questions explore deep and complex ideas—it's natural to find them challenging. If you'd like to pause, you can either restart the assessment later or book a session with one of our intellectual genetic counselors for personalized guidance.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogAction 
                className="bg-[#373763] text-white font-oxanium"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default to keep dialog open
                  handleBookCounselor();
                }}
              >
                BOOK A COUNSELOR
              </AlertDialogAction>
              <AlertDialogCancel 
                onClick={confirmExit}
                className="bg-[#E9E7E2]/50 text-[#373763] border border-[#373763]/20"
              >
                EXIT ASSESSMENT
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
      </div>

      <AIChatDialog 
        open={showAIChat}
        onOpenChange={setShowAIChat}
        sessionId={sessionStorage.getItem('dna_assessment_name') || 'Anonymous'}
        currentQuestion={currentQuestion?.question?.question || ''}
      />
    </>
  );
};

export default DNAAssessment;
