<svelte:options customElement={{ tag: 'haltmann-problem_one', shadow: 'none' }}/>
<script>
	import BaldigunnerStyle from "./shared/BaldigunnerStyle.svelte";
import GenericChallengePrompt from "./shared/GenericChallengePrompt.svelte";
</script>
<GenericChallengePrompt question={'SOLVE MATH Q1:'} endpoint="/bg/q1" submitText="OK!"/>
<BaldigunnerStyle/>