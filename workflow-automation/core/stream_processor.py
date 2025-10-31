"""
Stream Processor for LLM Outputs
=================================

Real-time streaming processor for GPT-4 outputs with Streamlit integration.
Supports async streaming with iter_chunked(1024) pattern.
"""

import asyncio
import aiohttp
import json
from typing import AsyncIterator, Optional, Callable, List, Dict, Any
from dataclasses import dataclass
import time


@dataclass
class StreamChunk:
    """Represents a chunk of streamed content"""
    content: str
    timestamp: float
    chunk_index: int
    is_final: bool = False
    metadata: Optional[Dict[str, Any]] = None


class StreamProcessor:
    """
    Processes streaming responses from LLM APIs with real-time callbacks.

    Features:
    - Async streaming with aiohttp
    - Chunk-based processing (1024 bytes)
    - Real-time callbacks for UI updates
    - JSON streaming support
    - Error handling and recovery
    """

    def __init__(self, api_key: str, base_url: str = "https://api.openai.com/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        """Context manager entry - create session"""
        self.session = aiohttp.ClientSession(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - close session"""
        if self.session:
            await self.session.close()

    async def stream_completion(
        self,
        prompt: str,
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        system_prompt: Optional[str] = None,
        on_chunk: Optional[Callable[[StreamChunk], None]] = None
    ) -> AsyncIterator[StreamChunk]:
        """
        Stream a completion from GPT-4 with real-time chunked processing.

        Args:
            prompt: User prompt
            model: Model identifier
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            system_prompt: Optional system prompt
            on_chunk: Optional callback for each chunk

        Yields:
            StreamChunk objects with content and metadata
        """
        if not self.session:
            raise RuntimeError("Session not initialized. Use 'async with' context manager.")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }

        chunk_index = 0
        full_content = ""

        try:
            async with self.session.post(
                f"{self.base_url}/chat/completions",
                json=payload
            ) as response:
                response.raise_for_status()

                # Stream response in chunks of 1024 bytes
                async for chunk_bytes in response.content.iter_chunked(1024):
                    chunk_text = chunk_bytes.decode('utf-8')

                    # Parse SSE (Server-Sent Events) format
                    for line in chunk_text.split('\n'):
                        if line.startswith('data: '):
                            data_str = line[6:].strip()

                            if data_str == '[DONE]':
                                # Final chunk
                                final_chunk = StreamChunk(
                                    content="",
                                    timestamp=time.time(),
                                    chunk_index=chunk_index,
                                    is_final=True,
                                    metadata={"full_content": full_content}
                                )
                                if on_chunk:
                                    on_chunk(final_chunk)
                                yield final_chunk
                                return

                            try:
                                data = json.loads(data_str)
                                delta = data.get('choices', [{}])[0].get('delta', {})
                                content = delta.get('content', '')

                                if content:
                                    full_content += content
                                    chunk = StreamChunk(
                                        content=content,
                                        timestamp=time.time(),
                                        chunk_index=chunk_index,
                                        metadata={"model": model}
                                    )
                                    chunk_index += 1

                                    if on_chunk:
                                        on_chunk(chunk)

                                    yield chunk

                            except json.JSONDecodeError:
                                # Skip malformed chunks
                                continue

        except aiohttp.ClientError as e:
            raise RuntimeError(f"Stream error: {str(e)}")

    async def stream_multiple_parallel(
        self,
        prompts: List[str],
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        system_prompt: Optional[str] = None,
        on_chunk: Optional[Callable[[int, StreamChunk], None]] = None
    ) -> List[str]:
        """
        Stream multiple completions in parallel.

        Args:
            prompts: List of prompts to process
            model: Model identifier
            temperature: Sampling temperature
            max_tokens: Maximum tokens per completion
            system_prompt: Optional system prompt
            on_chunk: Optional callback with (prompt_index, chunk)

        Returns:
            List of completed texts in same order as prompts
        """
        async def process_prompt(index: int, prompt: str) -> str:
            """Process a single prompt and collect all chunks."""
            full_text = ""
            async for chunk in self.stream_completion(
                prompt=prompt,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                system_prompt=system_prompt,
                on_chunk=lambda c: on_chunk(index, c) if on_chunk else None
            ):
                if not chunk.is_final:
                    full_text += chunk.content
            return full_text

        # Execute all prompts in parallel
        tasks = [process_prompt(i, prompt) for i, prompt in enumerate(prompts)]
        results = await asyncio.gather(*tasks)
        return results


if __name__ == "__main__":
    # Demo: Basic streaming
    async def demo():
        import os

        api_key = os.getenv("OPENAI_API_KEY", "sk-test")

        async with StreamProcessor(api_key) as processor:
            print("Streaming completion:\n")

            def print_chunk(chunk: StreamChunk):
                if not chunk.is_final:
                    print(chunk.content, end='', flush=True)
                else:
                    print("\n\n[Stream completed]")

            async for chunk in processor.stream_completion(
                prompt="Write a short poem about AI",
                on_chunk=print_chunk
            ):
                pass

    # Uncomment to run demo:
    # asyncio.run(demo())
    print("Stream processor ready. Use in async context.")
