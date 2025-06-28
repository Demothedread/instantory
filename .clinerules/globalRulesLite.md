R1 DIR_SCAN→INDEX_FILES
R2 SAMPLE(20–40L:first/entry/recent/keyword)
R3 MAP:modules,deps,entry,type→PROMPT_IF?  
R4 SEQ_THINK+STEP_PLAN(RAG)
R5 CTX_WIN_SLIDE+CTX_SHIFT_ALERT
R6 PATCH_FIRST→DIFF_PREVIEW→AWAIT
R7 MODULE≤300L, DOC→JSDOC+INLINE
R8 NAME:domain_prefix+ALPHA_SORT
R9 CSS:vars+fallbacks+alt
R10 IMPORT:tag_3P;audit_unused,depr
R11 ASSUME:_TAG;TODO:reason;SecVal
R12 LOG:chg(D/M);prune|stale
R13 VAL:Lint→Test→Iso(<5L);auto_resolve_errors;defer_warn
R14 ITER:auto_loop+iteration_cap;stop_on_limit
R15 AGENT_SWARM:Maestro/Network/Specialty
R16 OVERRIDE:later/local>global
R17 DOC:README(synopsis,pre,deploy,start,FAQ,usecases)+e2e_tests