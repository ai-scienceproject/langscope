// Organization logo mappings - returns paths to company logos
// Maps organization names to their logo files
export const getOrganizationLogo = (organizationName: string): string => {
  const name = organizationName.toLowerCase().trim();
  
  // Major LLM companies
  if (name.includes('openai')) {
    return '/logos/openai.svg';
  }
  if (name.includes('anthropic')) {
    return '/logos/anthropic.ico';
  }
  if (name.includes('google') || name.includes('deepmind')) {
    return '/logos/google.svg';
  }
  if (name.includes('meta') || name.includes('facebook')) {
    return '/logos/meta.svg';
  }
  if (name.includes('mistral')) {
    return '/logos/mistral.ico';
  }
  if (name.includes('cohere')) {
    return '/logos/cohere.ico';
  }
  if (name.includes('microsoft')) {
    return '/logos/microsoft.svg';
  }
  if (name.includes('deepseek')) {
    return '/logos/deepseek.ico';
  }
  if (name.includes('huggingface') || name.includes('hugging face')) {
    return '/logos/huggingface.ico';
  }
  if (name.includes('xai') || name === 'x.ai') {
    return '/logos/xai.ico';
  }
  if (name.includes('baidu')) {
    return '/logos/baidu.ico';
  }
  if (name.includes('alibaba')) {
    return '/logos/alibaba.ico';
  }
  if (name.includes('nvidia')) {
    return '/logos/nvidia.ico';
  }
  if (name.includes('amazon') || name.includes('aws')) {
    return '/logos/amazon.ico';
  }
  if (name.includes('apple')) {
    return '/logos/apple.ico';
  }
  if (name.includes('stability') || name.includes('stability ai')) {
    return '/logos/stability.ico';
  }
  if (name.includes('together') || name.includes('together ai')) {
    return '/logos/together.ico';
  }
  if (name.includes('perplexity') || name.includes('perplexity ai')) {
    return '/logos/perplexity.ico';
  }
  if (name.includes('01.ai') || name.includes('01ai') || name.includes('zero one ai')) {
    return '/logos/01ai.ico';
  }
  if (name.includes('qwen') || name.includes('alibaba cloud')) {
    return '/logos/qwen-color.svg'; // Qwen is by Alibaba
  }
  if (name.includes('internlm') || name.includes('intern lm')) {
    return '/logos/baidu.ico'; // InternLM is by Shanghai AI Lab, using Baidu as placeholder
  }
  if (name.includes('baichuan') || name.includes('baichuan ai')) {
    return '/logos/baidu.ico'; // Baichuan AI, using Baidu as placeholder
  }
  if (name.includes('ibm') || name.includes('watson')) {
    return '/logos/ibm.svg';
  }
  if (name.includes('huawei') || name.includes('pangu')) {
    return '/logos/huawei.svg';
  }
  
  // Default - return empty string (will use fallback in Avatar component)
  return '';
};

