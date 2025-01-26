<!-- svelte-ignore options_missing_custom_element -->
<svelte:options customElement={{ tag: 'haltmann-problem_two', shadow: 'none' }}/>
<script>
	import BaldigunnerStyle from "./shared/BaldigunnerStyle.svelte";
	import GenericChallengePrompt from "./shared/GenericChallengePrompt.svelte";
</script>
<GenericChallengePrompt question={'SOLVE MATH Q2:'} endpoint="/puzzle/bg/q2" submitText={'OK!'}/>
<BaldigunnerStyle/>